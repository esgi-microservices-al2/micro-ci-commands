<<<<<<< HEAD
FROM node:lts

COPY ./ /usr/local/src

WORKDIR /usr/local/src

ENV NODE_ENV "production"

RUN npm install && npm install --development && npm run build

CMD [ "npm", "start" ]
=======
FROM node:12

WORKDIR /home/command-build

COPY . /home/command-build

RUN npm ci && npm run build

CMD ["npm", "start"]
>>>>>>> 810c9fb4355bffde52f9b477f5a0b8f107019501
