const dotenv = require('dotenv');
dotenv.config();

// Import modules
const whatsappBot = require('./modules/whatsapp/bot');
const mqttClient = require('./modules/mqtt/client');
const sheetsClient = require('./modules/sheets/client');

// Start WhatsApp Bot
whatsappBot.initialize();

// Connect to MQTT broker
mqttClient.connect();
console.log("Memulai inisialisasi client WhatsApp...");
sheetsClient.initialize();
console.log("Inisialisasi selesai dipanggil!");

console.log('Sistem Pengadaan Barang dimulai...');

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
});

server.listen(8000, () => {
  console.log('Health check server running on port 8000');
});


// Handle process termination
process.on('SIGINT', async () => {
  console.log('Menutup aplikasi...');
  await whatsappBot.shutdown();
  mqttClient.disconnect();
  process.exit(0);
});