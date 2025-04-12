const dotenv = require('dotenv');
dotenv.config();

// Import modules
const whatsappBot = require('./modules/whatsapp/bot');
const mqttClient = require('./modules/mqtt/client');
const sheetsClient = require('./modules/sheets/client');

// Start WhatsApp Bot and handle setup async
(async () => {
  try {
    console.log('Menginisialisasi WhatsApp Bot...');
    await whatsappBot.initialize();
    
    // Connect to MQTT broker
    mqttClient.connect();
    
    // Initialize Google Sheets connection
    sheetsClient.initialize();
    
    console.log('Sistem Pengadaan Barang dimulai...');
  } catch (error) {
    console.error('Error saat menginisialisasi aplikasi:', error);
    process.exit(1);
  }
})();

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Menutup aplikasi...');
  await whatsappBot.shutdown();
  mqttClient.disconnect();
  process.exit(0);
});

// Handle SIGTERM (for hosting environments)
process.on('SIGTERM', async () => {
  console.log('Menerima sinyal SIGTERM. Menutup aplikasi...');
  await whatsappBot.shutdown();
  mqttClient.disconnect();
  process.exit(0);
});