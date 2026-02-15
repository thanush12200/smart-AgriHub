const axios = require('axios');

const kelvinToCelsius = (value) => Number((value - 273.15).toFixed(2));

const fallbackWeather = (region) => ({
  current: { region, tempC: 28, humidity: 58, condition: 'clear sky', windKph: 8 },
  forecast: [],
  alerts: []
});

const detectAlerts = (forecast = []) => {
  const alerts = [];

  forecast.forEach((item) => {
    if (item.maxTemp >= 38) {
      alerts.push({ type: 'heat_wave', date: item.date, message: 'Heat wave likely. Increase irrigation frequency.' });
    }
    if (item.minTemp <= 4) {
      alerts.push({ type: 'frost_warning', date: item.date, message: 'Frost risk. Use crop cover during night.' });
    }
    if (item.rainMm >= 40) {
      alerts.push({ type: 'heavy_rain', date: item.date, message: 'Heavy rain expected. Improve field drainage.' });
    }
  });

  return alerts;
};

const mapOpenWeatherForecast = (entries = []) => {
  const days = {};

  entries.forEach((entry) => {
    const date = entry.dt_txt?.slice(0, 10);
    if (!date) return;

    if (!days[date]) {
      days[date] = {
        date,
        minTemp: kelvinToCelsius(entry.main.temp_min),
        maxTemp: kelvinToCelsius(entry.main.temp_max),
        humidity: entry.main.humidity,
        rainMm: entry.rain?.['3h'] || 0,
        description: entry.weather?.[0]?.description || 'n/a'
      };
      return;
    }

    days[date].minTemp = Math.min(days[date].minTemp, kelvinToCelsius(entry.main.temp_min));
    days[date].maxTemp = Math.max(days[date].maxTemp, kelvinToCelsius(entry.main.temp_max));
    days[date].humidity = Math.round((days[date].humidity + entry.main.humidity) / 2);
    days[date].rainMm += entry.rain?.['3h'] || 0;
  });

  return Object.values(days).slice(0, 7);
};

const getWeatherBundle = async (region) => {
  const key = process.env.WEATHER_API_KEY;
  const base = process.env.WEATHER_API_BASE;

  if (!key || !base) {
    return fallbackWeather(region);
  }

  try {
    if (base.includes('weatherapi.com')) {
      const currentUrl = `${base}/current.json?key=${key}&q=${encodeURIComponent(region)}&aqi=no`;
      const forecastUrl = `${base}/forecast.json?key=${key}&q=${encodeURIComponent(region)}&days=7&aqi=no&alerts=yes`;
      const [currentRes, forecastRes] = await Promise.all([axios.get(currentUrl), axios.get(forecastUrl)]);

      const current = {
        region: currentRes.data.location.name,
        tempC: currentRes.data.current.temp_c,
        humidity: currentRes.data.current.humidity,
        condition: currentRes.data.current.condition.text,
        windKph: currentRes.data.current.wind_kph
      };

      const forecast = forecastRes.data.forecast.forecastday.map((day) => ({
        date: day.date,
        minTemp: day.day.mintemp_c,
        maxTemp: day.day.maxtemp_c,
        humidity: day.day.avghumidity,
        rainMm: day.day.totalprecip_mm,
        description: day.day.condition.text
      }));

      return { current, forecast, alerts: detectAlerts(forecast) };
    }

    const currentUrl = `${base}/weather?q=${encodeURIComponent(region)}&appid=${key}`;
    const forecastUrl = `${base}/forecast?q=${encodeURIComponent(region)}&appid=${key}`;

    const [currentRes, forecastRes] = await Promise.all([axios.get(currentUrl), axios.get(forecastUrl)]);

    const current = {
      region: currentRes.data.name,
      tempC: kelvinToCelsius(currentRes.data.main.temp),
      humidity: currentRes.data.main.humidity,
      condition: currentRes.data.weather?.[0]?.description || 'n/a',
      windKph: Number((currentRes.data.wind.speed * 3.6).toFixed(1))
    };

    const forecast = mapOpenWeatherForecast(forecastRes.data.list || []);

    return { current, forecast, alerts: detectAlerts(forecast) };
  } catch (error) {
    return fallbackWeather(region);
  }
};

module.exports = { getWeatherBundle, detectAlerts };
