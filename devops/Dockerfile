FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts
COPY . .
# Backend tests and docs generation only — no Nuxt UI build required
CMD ["npm", "run", "test:backend"]
