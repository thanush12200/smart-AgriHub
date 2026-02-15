const axios = require('axios');
const ApiError = require('../utils/ApiError');
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash';
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const CHAT_SYSTEM_INSTRUCTION = [
  'You are an expert Agricultural Scientist and advisor for farmers.',
  'Always speak in very simple, friendly, and practical language.',
  'Be warm, concise, and avoid complex scientific jargon.',
  'Give step-by-step, actionable farming advice.',
  'If uncertain, clearly say what extra details are needed (crop, symptom, weather, soil).',
  'Prioritize farmer safety and sustainable practices.'
].join(' ');

const cropAliasMap = {
  paddy: 'rice',
  rice: 'rice',
  wheat: 'wheat',
  maize: 'maize',
  corn: 'maize',
  cotton: 'cotton',
  sugarcane: 'sugarcane',
  tomato: 'tomato',
  unknown: 'unknown'
};

const unknownTokens = new Set([
  'unknown',
  'not sure',
  'unsure',
  'uncertain',
  'unidentified',
  'na',
  'n/a',
  'none'
]);

const toTitleCase = (value) =>
  String(value || '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const responseSchema = {
  type: 'OBJECT',
  properties: {
    cropName: { type: 'STRING' },
    commonName: { type: 'STRING' },
    scientificName: { type: 'STRING' },
    confidence: { type: 'NUMBER' },
    healthStatus: { type: 'STRING' },
    description: { type: 'STRING' },
    careTips: {
      type: 'ARRAY',
      items: { type: 'STRING' }
    },
    detectedIssues: {
      type: 'ARRAY',
      items: { type: 'STRING' }
    },
    topMatches: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          crop: { type: 'STRING' },
          score: { type: 'NUMBER' }
        },
        required: ['crop', 'score']
      }
    }
  },
  required: ['cropName', 'confidence', 'healthStatus', 'description', 'careTips']
};

const normalizeCrop = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return 'unknown';

  if (unknownTokens.has(raw)) return 'unknown';
  if (cropAliasMap[raw]) return cropAliasMap[raw];

  for (const [alias, canonical] of Object.entries(cropAliasMap)) {
    if (raw.includes(alias)) return canonical;
  }

  const cleaned = raw
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || unknownTokens.has(cleaned)) return 'unknown';
  return cleaned;
};

const clampConfidence = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0.55;
  const normalized = num > 1 ? num / 100 : num;
  return Math.max(0, Math.min(1, Number(normalized.toFixed(4))));
};

const cleanJsonText = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';

  if (text.startsWith('```')) {
    return text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();
  }

  return text;
};

const extractGeminiText = (responseData) => {
  const parts = responseData?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!text) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'Gemini returned empty response');
  }

  return text;
};

const uniqueModels = (models) => [...new Set(models.filter(Boolean))];

const normalizeHistory = (history) => {
  if (!Array.isArray(history)) return [];

  return history
    .map((item) => {
      const role = item?.role === 'model' ? 'model' : 'user';
      const parts = Array.isArray(item?.parts)
        ? item.parts
            .map((part) => String(part?.text || '').trim())
            .filter(Boolean)
            .slice(0, 2)
            .map((text) => ({ text: text.slice(0, 900) }))
        : [];

      if (!parts.length) return null;
      return { role, parts };
    })
    .filter(Boolean)
    .slice(-16);
};

const parseGeminiJson = (responseData) => {
  const text = extractGeminiText(responseData);

  try {
    return JSON.parse(cleanJsonText(text));
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'Gemini returned invalid JSON output');
  }
};

const toDetectionShape = (raw, modelName) => {
  const normalizedCropName = normalizeCrop(raw.cropName || raw.plant);
  const normalizedCommonName = normalizeCrop(raw.commonName);
  const plantName = normalizedCropName !== 'unknown' ? normalizedCropName : normalizedCommonName;

  const commonName = String(raw.commonName || raw.cropName || '').trim()
    || (plantName !== 'unknown' ? toTitleCase(plantName) : 'Unknown plant');
  const scientificName = String(raw.scientificName || '').trim();
  const confidence = clampConfidence(raw.confidence);

  const description = String(raw.description || '').trim() || 'Plant analysis completed.';
  const healthStatus = String(raw.healthStatus || '').trim() || 'Health assessment available in description.';

  const careTips = Array.isArray(raw.careTips)
    ? raw.careTips.map((item) => String(item).trim()).filter(Boolean).slice(0, 6)
    : [];

  const detectedIssues = Array.isArray(raw.detectedIssues)
    ? raw.detectedIssues.map((item) => String(item).trim()).filter(Boolean).slice(0, 6)
    : [];

  let topMatches = Array.isArray(raw.topMatches)
    ? raw.topMatches
        .map((item) => ({
          crop: normalizeCrop(item?.crop || ''),
          score: clampConfidence(item?.score)
        }))
        .filter((item) => item.crop !== 'unknown' || item.score > 0)
        .slice(0, 3)
    : [];

  if (plantName !== 'unknown') {
    topMatches = topMatches.filter((item) => item.crop !== 'unknown');

    if (!topMatches.some((item) => item.crop === plantName)) {
      topMatches.unshift({ crop: plantName, score: confidence });
    }
  }

  topMatches = topMatches.slice(0, 3);

  if (!topMatches.length && plantName !== 'unknown') {
    topMatches.push({ crop: plantName, score: confidence });
  }

  return {
    plant: plantName,
    commonName,
    scientificName,
    confidence,
    healthStatus,
    description,
    careTips,
    detectedIssues,
    topMatches,
    source: 'gemini_vision',
    modelVersion: modelName
  };
};

const buildPrompt = () => {
  return [
    'Analyze this plant image for agricultural crop identification and health diagnostics.',
    'Return only strict JSON with keys:',
    'cropName, commonName, scientificName, confidence, healthStatus, description, careTips, detectedIssues, topMatches.',
    'Rules:',
    '- cropName should be the best plant/crop name visible in the image (for example: rice, wheat, maize, cotton, sugarcane, tomato, pineapple).',
    '- Use "unknown" only if the image is truly unclear.',
    '- confidence must be numeric between 0 and 1.',
    '- careTips must contain actionable farmer guidance (3 to 6 points).',
    '- Include disease/pest/nutrient stress in detectedIssues if visible, otherwise empty array.',
    '- topMatches must include up to 3 likely crops/plants with score between 0 and 1.'
  ].join(' ');
};

const callGemini = async ({ apiKey, modelName, mimeType, imageBase64, withSchema, timeoutMs = 18000 }) => {
  const url = `${GEMINI_BASE_URL}/models/${modelName}:generateContent`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: buildPrompt() },
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.9,
      responseMimeType: 'application/json'
    }
  };

  if (withSchema) {
    body.generationConfig.responseSchema = responseSchema;
  }

  return axios.post(url, body, {
    params: { key: apiKey },
    timeout: timeoutMs
  });
};

const callGeminiChat = async ({
  apiKey,
  modelName,
  history,
  prompt,
  region,
  language,
  timeoutMs = 12000,
  withSystemInstruction = true
}) => {
  const url = `${GEMINI_BASE_URL}/models/${modelName}:generateContent`;

  const userPrompt = [
    `Farmer region: ${region || 'India'}.`,
    `Language preference: ${language || 'en'}.`,
    'Reply in plain and practical farmer-friendly style.',
    `User question: ${prompt}`
  ].join('\n');

  const contents = [...history, { role: 'user', parts: [{ text: userPrompt }] }];
  const body = {
    contents,
    generationConfig: {
      temperature: 0.35,
      topP: 0.9,
      maxOutputTokens: 700
    }
  };

  if (withSystemInstruction) {
    body.systemInstruction = { parts: [{ text: CHAT_SYSTEM_INSTRUCTION }] };
  }

  return axios.post(url, body, {
    params: { key: apiKey },
    timeout: timeoutMs
  });
};

const askChatWithGemini = async ({ prompt, history = [], region, language }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const primaryModel = process.env.GEMINI_CHAT_MODEL || process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const configuredFallback = process.env.GEMINI_CHAT_FALLBACK_MODEL || process.env.GEMINI_FALLBACK_MODEL || FALLBACK_MODEL;
  const candidateModels = uniqueModels([primaryModel, configuredFallback, 'gemini-2.5-flash']);
  const normalizedHistory = normalizeHistory(history);

  for (let index = 0; index < candidateModels.length; index += 1) {
    const modelName = candidateModels[index];
    const timeoutMs = index === 0 ? 8000 : 15000;

    try {
      let response;
      try {
        response = await callGeminiChat({
          apiKey,
          modelName,
          history: normalizedHistory,
          prompt,
          region,
          language,
          timeoutMs,
          withSystemInstruction: true
        });
      } catch (error) {
        if (error.response?.status === 400) {
          response = await callGeminiChat({
            apiKey,
            modelName,
            history: normalizedHistory,
            prompt,
            region,
            language,
            timeoutMs,
            withSystemInstruction: false
          });
        } else {
          throw error;
        }
      }

      const answer = extractGeminiText(response.data);
      return {
        answer,
        confidence: 0.92,
        source: 'gemini_chat',
        intent: 'expert_assistant',
        modelVersion: modelName
      };
    } catch (error) {
      logger.warn(`Gemini chat failed for model ${modelName}: ${error.message}`);
    }
  }

  logger.warn('Gemini chat failed on all configured models');
  return null;
};

const detectPlantWithGemini = async ({ imageBase64, mimeType }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return null;
  }

  const runForModel = async (activeModel, timeoutMs) => {
    try {
      let response;
      try {
        response = await callGemini({
          apiKey,
          modelName: activeModel,
          mimeType,
          imageBase64,
          withSchema: true,
          timeoutMs
        });
      } catch (error) {
        if (error.response?.status === 400) {
          response = await callGemini({
            apiKey,
            modelName: activeModel,
            mimeType,
            imageBase64,
            withSchema: false,
            timeoutMs
          });
        } else {
          throw error;
        }
      }

      const parsed = parseGeminiJson(response.data);
      return toDetectionShape(parsed, activeModel);
    } catch (error) {
      logger.warn(`Gemini plant detection failed for model ${activeModel}: ${error.message}`);
      return null;
    }
  };

  let detection = await runForModel(modelName, 8000);
  if (detection) return detection;

  if (FALLBACK_MODEL && FALLBACK_MODEL !== modelName) {
    detection = await runForModel(FALLBACK_MODEL, 15000);
    if (detection) return detection;
  }

  if (modelName !== 'gemini-2.5-flash' && FALLBACK_MODEL !== 'gemini-2.5-flash') {
    detection = await runForModel('gemini-2.5-flash', 15000);
    if (detection) return detection;
  }

  logger.warn('Gemini plant detection failed on all configured models');
    return null;
};

module.exports = { detectPlantWithGemini, askChatWithGemini };
