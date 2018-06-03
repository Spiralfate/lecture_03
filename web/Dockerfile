FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./
COPY .babelrc ./

COPY server ./

RUN npm install

RUN npm run build

EXPOSE 8080

CMD [ "node", "server.js" ]
