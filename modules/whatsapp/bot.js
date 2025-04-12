const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const handlers = require('./handlers');
const puppeteer = require('puppeteer-core');
let messageHandler = null;

// In bot.js
const client = new Client({
  authStrategy: new LocalAuth({ 
    dataPath: './.wwebjs_auth',  
    clientId: 'procurement-bot' // Use a fixed client ID
  }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-component-extensions-with-background-pages',
      '--disable-default-apps',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-timer-throttling',
      '--disable-background-networking',
      '--disable-features=TranslateUI',
      '--disable-sync',
      '--disable-notifications',
      '--single-process', // This can help with memory issues
      '--memory-pressure-off',
      '--js-flags="--max-old-space-size=128"' // Reduce memory used by JS
    ]
  }
});

// Add memory management helpers
function logMemoryUsage() {
  const used = process.memoryUsage();
  console.log('Memory usage:');
  for (const key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
}

// Log memory usage periodically
setInterval(logMemoryUsage, 60000);

// Add this to help with memory issues
process.on('memoryUsage', () => {
  logMemoryUsage();
  if (global.gc) {
    console.log('Forcing garbage collection');
    global.gc();
  }
});
// Set the handler later
function setMessageHandler(handler) {
  messageHandler = handler;
}

client.on('message', async (msg) => {
  if (messageHandler) {
    await messageHandler(client, msg);
  }
});

function initialize() {
  client.on('qr', (qr) => {
    console.log('QR Code diterima, silahkan scan dengan WhatsApp Anda:');
    qrcode.generate(qr, { small: true });
  });

// In bot.js
client.on('disconnected', async (reason) => {
  console.log('WhatsApp terputus karena:', reason);
  
  // Add a delay before attempting to reconnect
  console.log('Menunggu 5 detik sebelum menyambung ulang...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('Mencoba menyambung ulang...');
  try {
    await client.initialize();
    console.log('Reconnect berhasil');
  } catch (error) {
    console.error('Gagal reconnect:', error);
  }
});

// Add a more robust health check
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

setInterval(async () => {
  console.log('Memeriksa status koneksi WhatsApp...');
  
  try {
    // Try to get client state - this will fail if the client isn't properly connected
    const isConnected = client.info && client.info.wid;
    
    if (isConnected) {
      console.log('WhatsApp masih terhubung:', new Date().toISOString());
      reconnectAttempts = 0; // Reset attempts counter
    } else {
      console.log('Status WhatsApp tidak aktif:', new Date().toISOString());
      
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Mencoba reconnect (percobaan ke-${reconnectAttempts})...`);
        await client.initialize();
      } else {
        console.error('Batas percobaan reconnect tercapai, restart container diperlukan');
        // You could add logic to exit the process here to trigger a container restart
        // process.exit(1);
      }
    }
  } catch (error) {
    console.error('Error saat memeriksa status koneksi:', error);
  }
}, 60000); // Every minute

  client.on('ready', () => {
    console.log('WhatsApp Bot siap digunakan!');
  });

  client.on('authenticated', () => {
    console.log('Autentikasi berhasil!');
  });

  client.on('auth_failure', (msg) => {
    console.error('Autentikasi gagal:', msg);
  });

  // Handle incoming messages
  client.on('message', async (msg) => {
    await handlers.handleMessage(client, msg);
  });

  // Initialize the client
  client.initialize();

  return client;
}

// Function to send a message to a specific number
async function sendMessage(to, message) {
  try {
    console.log(`Mencoba mengirim pesan ke ${to}...`);
    const formattedNumber = to.includes('@c.us') ? to : `${to}@c.us`;
    await client.sendMessage(formattedNumber, message);
    console.log(`Pesan terkirim ke ${to}`);
    
    // Force garbage collection if available (Node with --expose-gc flag)
    if (global.gc) {
      global.gc();
    }
    
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
  client,
  setMessageHandler
};