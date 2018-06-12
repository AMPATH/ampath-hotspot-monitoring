const config = require('../../config/config');
const monk = require('monk');
const db = monk(config.mongo.url);
export class MongoService {

    saveBandWidthStats(stats) {
        const bandWidthStats = db.get('bandWidthStats');
        bandWidthStats.index('uuid');
        return bandWidthStats.insert(stats);
    }

    getBandWidthStatsByUUID(uuid) {
        const bandWidthStats = db.get('bandWidthStats');
        return bandWidthStats.find({
            uuid: uuid
        }).then((docs) => {
            return this.resolveLocations(docs);
        });
    }

    getBandWidthStats(uuid) {
        const bandWidthStats = db.get('bandWidthStats');
        return bandWidthStats.find({}).then((docs) => {
            return this.resolveLocations(docs);
        });
    }


    saveHealthStats(stats) {
        const healthStats = db.get('healthStats')
        healthStats.index('uuid')
        return healthStats.insert(stats);
    }

    getHealthStatsByUUID(uuid) {
        const healthStats = db.get('healthStats')
        return healthStats.find({
            uuid: uuid
        }).then((docs) => {
            return this.resolveLocations(docs);
        });
    }

    getHealthStats() {
        const healthStats = db.get('healthStats')
        return healthStats.find({}).then((docs) => {
            return this.resolveLocations(docs);
        });
    }

    resolveLocations(docs) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let resolvedLocations = [];
            try {
                for (let location of config.locations) {
                    let statistics = docs.filter((obj) => {
                        return obj.uuid === location.uuid;
                    });
                    if (statistics.length === 0) {
                        continue;
                    }
                    statistics.map(function(item) { 
                        delete item.uuid; 
                        return item; 
                    });
                    let resolvedLocation = {
                        uuid: location.uuid,
                        name: location.name,
                        statistics
                    }
                    resolvedLocations.push(resolvedLocation);
                }
                resolve(resolvedLocations);
            } catch (error) {
                reject(error);
            }
        });
    }

    getLocation(uuid) {
        return config.locations.find(function (obj) {
            return obj.uuid === uuid;
        });
    }
}