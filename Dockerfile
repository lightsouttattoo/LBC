FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --production
COPY dist ./dist
COPY server.ts ./

EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
