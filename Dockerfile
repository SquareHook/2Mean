from node:7.3.0

WORKDIR /tmp
COPY package.json /tmp
RUN npm install

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN cp -a /tmp/node_modules /usr/src/app/
RUN npm build

CMD ["npm", "start"]
EXPOSE 3080 3443
