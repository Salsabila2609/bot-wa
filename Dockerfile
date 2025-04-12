FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /app

# Copy & install dependencies
COPY package*.json ./
RUN npm install

# Copy semua file ke dalam container
COPY . .

# Jalankan bot
CMD ["node", "index.js"]
