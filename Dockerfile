FROM node:18-slim AS development

RUN apt-get update

RUN apt-get install -y openssl

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install glob rimraf

RUN npm install

RUN npx prisma generate

RUN npm run build
