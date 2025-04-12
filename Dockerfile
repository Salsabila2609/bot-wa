FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies sebagai root
USER root
RUN npm install

# Kembali ke user pptruser setelah instalasi
USER pptruser

# Copy sisa file ke dalam container
COPY . .

# Jalankan aplikasi
CMD ["node", "index.js"]
