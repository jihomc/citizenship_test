FROM node:10-alpine

ARG NODE_ENV

ENV NODE_ENV=${NODE_ENV}

RUN apk add --no-cache git

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait

RUN chmod +x /wait

COPY package*.json ts*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD npm run start
