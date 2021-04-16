FROM ubuntu:18.04

RUN apt-get update --fix-missing
RUN apt-get install -y python
RUN apt-get install -y gcc
RUN apt-get install -y libtool autoconf g++
RUN apt-get install -y automake
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential
RUN apt-get install -y make cmake

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 8080
CMD ["node_modules/.bin/next", "start", "-p", "8080"]