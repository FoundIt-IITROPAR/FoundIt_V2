FROM node:20-alpine

WORKDIR /test

COPY . .

RUN npm install && npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
