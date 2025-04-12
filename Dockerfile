# Base image dengan Node.js
FROM node:18-slim

# Install Chromium & dependensinya
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libnss3 \
  libxss1 \
  libasound2 \
  xdg-utils \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*


# Set direktori kerja
WORKDIR /app

# Copy file dependency dulu untuk install lebih cepat
COPY package*.json ./

# Install dependency Node.js
RUN npm install

# Copy semua source code
COPY . .

# Set environment variable lokasi Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Jalankan bot
CMD ["node", "index.js"]
