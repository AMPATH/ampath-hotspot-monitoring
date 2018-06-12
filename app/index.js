'use strict';

const Hapi = require('hapi');
const tabletojson = require('tabletojson');
import {
    MongoService
} from './services/mongo.service';

const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0'
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Ampath Site hotspot reporting server';
    }
});

server.route({
    method: 'GET',
    path: '/bundles/{uuid}',
    handler: (request, h) => {
        let uuid = request.params.uuid;
        const converted = tabletojson.convert(request.query.data);
        if (converted.length > 0) {
            let convertedMain = converted[0];
            let airTimeBalance = convertedMain[1]['1'];
            let airTimeExpiry = convertedMain[2]['1'];
            let dataBalance = convertedMain[3]['1'];
            let dataExpiry = convertedMain[4]['1'];
            let finalStats = {
                uuid,
                airTimeBalance,
                airTimeExpiry,
                dataBalance,
                dataExpiry
            };
            let service = new MongoService();
            return service.saveBandWidthStats(finalStats);
        } else {
            return 'Wrong Data';
        }
    }
});

server.route({
    method: 'GET',
    path: '/mikrotik-stats/{uuid}',
    handler: (request, h) => {
        let uuid = request.params.uuid;
        let service = new MongoService();
        let stats = Object.assign({
            uuid
        }, request.query);
        return service.saveHealthStats(stats);

    }
});


server.route({
    method: 'GET',
    path: '/hotspot-health-stats',
    handler: (request, h) => {
        let service = new MongoService();
       return service.getHealthStats();
    }
});

server.route({
    method: 'GET',
    path: '/hotspot-bandwidth-stats',
    handler: (request, h) => {
        let service = new MongoService();
        return service.getBandWidthStats();
    }
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();