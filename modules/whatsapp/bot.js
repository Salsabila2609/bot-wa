const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const handlers = require('./handlers');


const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});


async function initialize() {
  return new Promise((resolve, reject) => {
    client.on('qr', (qr) => {
      console.log('QR Code diterima, silahkan scan dengan WhatsApp Anda:');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      console.log('WhatsApp Bot siap digunakan!');
      resolve(); // selesai init
    });

    client.on('authenticated', () => {
      console.log('Autentikasi berhasil!');
    });

    client.on('auth_failure', (msg) => {
      console.error('Autentikasi gagal:', msg);
      reject(new Error('Autentikasi gagal'));
    });

    client.on('message', async (msg) => {
      await handlers.handleMessage(client, msg);
    });

    client.initialize();
  });
}


// Function to send a message to a specific number
async function sendMessage(to, message) {
    try {
      console.log(`Mencoba mengirim pesan ke ${to}...`);
      const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
      await client.sendMessage(formattedNumber, message);
      console.log(`Pesan terkirim ke ${to}`);
      return true;
    } catch (error) {
      console.error(`Gagal mengirim pesan ke ${to}:`, error);
      return false;
    }
  }

// Function to shutdown the bot gracefully
async function shutdown() {
  console.log('Menutup koneksi WhatsApp Bot...');
  await client.destroy();
  console.log('WhatsApp Bot ditutup.');
}

module.exports = {
  initialize,
  sendMessage,
  shutdown,
  client
};