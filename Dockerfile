FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

RUN npm ci
RUN npx prisma generate

COPY src ./src
COPY index.ts ./

EXPOSE 3000

CMD ["npm", "run", "start"]