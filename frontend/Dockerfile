FROM node:20-alphine

WORKDIR /test

COPY . .

RUN npm install && npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]