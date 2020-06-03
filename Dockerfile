FROM keymetrics/pm2:latest-alpine

COPY . /opt/app
WORKDIR  /opt/app
RUN apk add --no-cache git
RUN   yarn install 
RUN apk add --no-cache tzdata
ENV TZ Africa/Nairobi

CMD ["yarn", "start" ]