FROM node:12

WORKDIR /home/command-build

COPY . /home/command-build

RUN npm ci && npm run build

CMD ["npm", "start"]