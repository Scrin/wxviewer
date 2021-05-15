FROM node:14 as frontend-build

RUN mkdir /src
COPY . /src
WORKDIR /src
RUN yarn install
RUN yarn build

FROM golang:1.15

COPY --from=frontend-build /src/build/ /static/
COPY backend.go /go/src/backend/backend.go

RUN go get backend/...
RUN go install backend

CMD backend
