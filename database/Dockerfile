FROM node:10-alpine

RUN apk add --no-cache git

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait

RUN chmod +x /wait

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

CMD ["sh", "-cx", "/wait && node build_database.js && node get_testupdates.js && node get_geo.js && node get_reps.js"]
