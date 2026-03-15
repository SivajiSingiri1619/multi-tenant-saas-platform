FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Prisma needs this
RUN npx prisma generate

EXPOSE 5000

CMD npx prisma migrate deploy \
 && npx prisma db seed \
 && node src/server.js
