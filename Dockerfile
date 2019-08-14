FROM node:11 as build

RUN mkdir /src
COPY . /src
WORKDIR /src
RUN yarn install
RUN yarn build

FROM httpd:2.4

COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY ./list.sh /usr/local/apache2/cgi-bin/list.sh
RUN chmod 755 /usr/local/apache2/cgi-bin/list.sh
