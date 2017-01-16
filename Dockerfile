from node:7.3.0

RUN npm install -g node-gyp

WORKDIR /tmp
COPY package.json /tmp
RUN npm install

WORKDIR /usr/src/app
COPY . /usr/src/app

CMD ["npm", "start"]
EXPOSE 3080 3443
