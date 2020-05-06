FROM node:11 as frontend-build

RUN mkdir /src
COPY . /src
WORKDIR /src
RUN yarn install
RUN yarn build

FROM golang:1.14 as backend-build

COPY list.go /go/list.go
RUN go build /go/list.go

FROM httpd:2.4

COPY --from=frontend-build /src/build/ /usr/local/apache2/htdocs/
COPY --from=backend-build /go/list /usr/local/apache2/cgi-bin/list
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
