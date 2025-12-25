FROM node:18-alpine

WORKDIR /app

# copy only react app
COPY react-app/package*.json ./

RUN npm install

COPY react-app .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]
