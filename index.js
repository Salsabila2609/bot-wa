const dotenv = require('dotenv');
dotenv.config();

const whatsappBot = require('./modules/whatsapp/bot');
const mqttClient = require('./modules/mqtt/client');
const sheetsClient = require('./modules/sheets/client');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

// Health check endpoint (biar Koyeb bisa tau server jalan)
app.get('/', (req, res) => {
  res.send('WA Bot Running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

(async () => {
  try {
    console.log('Memulai WhatsApp Bot...');
    await whatsappBot.initialize(); // sekarang menunggu init selesai

    mqttClient.connect();
    sheetsClient.initialize();

    console.log('Sistem Pengadaan Barang dimulai...');
  } catch (error) {
    console.error('Gagal memulai WhatsApp Bot:', error.message);
    process.exit(1); // exit dengan error biar Koyeb restart atau notify
  }
})();

process.on('SIGINT', async () => {
  console.log('Menutup aplikasi...');
  await whatsappBot.shutdown();
  mqttClient.disconnect();
  process.exit(0);
});
