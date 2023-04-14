FROM node:14-alpine

RUN apk add --no-cache libpng-dev autoconf automake make g++ libtool nasm

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "start" ]