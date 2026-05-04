# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Based on your logs, your backend runs on 8081
EXPOSE 8081
CMD ["node", "server.js"]