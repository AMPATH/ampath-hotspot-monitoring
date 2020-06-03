# ampath-hotspot-monitoring
This repo contains  router os scripts to collect stats from ampath hostspots and a node server to receive and store the stats
It also provides and api to get the stats

# Deploy to Prod
build the image
`docker build -t 10.50.80.56:5005/hotspot-monitoring-app:latest .`

push the image to registry
`docker push 10.50.80.56:5005/hotspot-monitoring-app:latest`

ssh into server and clone the repo
`git clone https://github.com/AMPATH/ampath-hotspot-monitoring.git`
and
`cd ampath-hotspot-monitoring`

modify config/config.json by changing the mongo url
```json
"mongo": {
  "url":"<server_ip_address>:27017/hotspotmonitoring"
}
```
start the containers
`docker-compose -f docker-compose.prod.yml up -d`




