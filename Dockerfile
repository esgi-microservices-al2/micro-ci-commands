FROM node:lts-buster-slim

COPY ./ /usr/local/src

LABEL MICROSERVICE_NAME commands

WORKDIR /usr/local/src

ENV NODE_ENV "production"

RUN npm install && npm install --only=development && npm run build

CMD [ "npm", "start" ]
