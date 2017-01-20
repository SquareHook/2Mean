from node:7.3.0

RUN apt-get update
RUN npm install -g node-gyp

WORKDIR /usr/src/app
ADD package.json /usr/src/app
RUN npm install

ADD . /usr/src/app

# This is run by post install but the script it uses is not there until the
# the previous step
RUN npm run gen-cert --unsafe-perm


EXPOSE 3080 3443
CMD ["npm", "start"]
