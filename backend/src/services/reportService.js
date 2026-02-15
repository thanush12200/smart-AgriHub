const PDFDocument = require('pdfkit');

const buildDashboardReport = (analytics) =>
  new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text('Smart Agri Hub - Farmer Report', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toISOString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Prediction Summary');
    doc.fontSize(11).text(`Crop Predictions: ${analytics.summary.cropPredictions}`);
    doc.fontSize(11).text(`Fertilizer Recommendations: ${analytics.summary.fertilizerRecommendations}`);
    doc.fontSize(11).text(`Chat Queries: ${analytics.summary.chatQueries}`);

    doc.moveDown();
    doc.fontSize(14).text('Soil Health Snapshot');
    analytics.soilHealth.forEach((item) => doc.fontSize(11).text(`${item.metric}: ${item.value}`));

    doc.moveDown();
    doc.fontSize(14).text('Recent Alerts');
    if (!analytics.alerts.length) {
      doc.fontSize(11).text('No weather alerts currently.');
    } else {
      analytics.alerts.forEach((alert) => doc.fontSize(11).text(`- ${alert.date}: ${alert.message}`));
    }

    doc.end();
  });

module.exports = { buildDashboardReport };
