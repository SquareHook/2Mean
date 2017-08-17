FROM node:8

RUN apt-get update
RUN npm install -g node-gyp

WORKDIR /usr/src/app
ADD package.json /usr/src/app
ADD npm-shrinkwrap.json /usr/src/app
RUN npm install

ADD . /usr/src/app

# This is run by post install but the script it uses is not there until the
# the previous step
RUN npm run gen-cert --unsafe-perm


EXPOSE 3080 3443
CMD ["npm", "start"]
# fix stdin is not a tty error
RUN grep -v "mesg n" ~/.profile > /tmp/.profile; \
    cat /tmp/.profile > ~/.profile
