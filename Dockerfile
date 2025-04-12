FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

COPY package*.json ./
RUN chown -R pptruser:pptruser /app
USER pptruser
RUN npm install

COPY . .
CMD ["node", "index.js"]
