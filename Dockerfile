FROM node:lts

COPY ./ /usr/local/src

WORKDIR /usr/local/src

ENV NODE_ENV "production"

RUN npm install && npm install --development && npm run build

CMD [ "npm", "start" ]
