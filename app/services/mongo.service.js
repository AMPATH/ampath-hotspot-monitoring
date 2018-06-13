const config = require('../../config/config');
const monk = require('monk');
const db = monk(config.mongo.url);
const moment = require('moment');
export class MongoService {

    saveBandWidthStats(stats) {
        const bandWidthStats = db.get('bandWidthStats');
        bandWidthStats.index('uuid');
        bandWidthStats.index('dateTimeReceived');
        return bandWidthStats.insert(stats);
    }

    getBandWidthStatsByUUID(uuid) {
        const bandWidthStats = db.get('bandWidthStats');
        return bandWidthStats.find({
            uuid: uuid
        }).then((docs) => {
            return this.resolveLocations(docs, date, true);
        });
    }

    getBandWidthStats(date) {
        const start = moment(date).startOf('day').toDate();
        const end = moment(date).endOf('day').toDate();
        const bandWidthStats = db.get('bandWidthStats');
        return bandWidthStats.find({
            'dateTimeReceived': {
                $gte: start,
                $lte:  end
            }
        }).then((docs) => {
            return this.resolveLocations(docs, date, true);
        });
    }


    saveHealthStats(stats) {
        const healthStats = db.get('healthStats');
        healthStats.index('uuid');
        healthStats.index('dateTimeReceived');
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

    getHealthStats(date) {
        const start = moment(date).startOf('day').toDate();
        const end = moment(date).endOf('day').toDate();
        const healthStats = db.get('healthStats')
        return healthStats.find({
            'dateTimeReceived': {
                $gte: start,
                $lte:  end
            }
        }).then((docs) => {
            return this.resolveLocations(docs);
        });
    }

    resolveLocations(docs, date, isBandWidth) {
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
                    statistics.map(function (item) {
                        delete item.uuid;
                        return item;
                    });
                    let usage = null;
                    if (isBandWidth) {
                        usage = that.usageForDate(statistics, date);
                    }
                    let resolvedLocation = {
                        uuid: location.uuid,
                        name: location.name,
                        usage,
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

    usageForDate(statistics, date) {
        let todayStats = statistics.filter((obj) => {
            return obj.dateTimeReceived && moment(obj.dateTimeReceived).format('YYYYMMDD') === moment(date).format('YYYYMMDD');
        });
        var maxDate = this.getMaxDateStat(todayStats);
        var minDate = this.getMinDateStat(todayStats);
        let usage = this.retnum(minDate.dataBalance) - this.retnum(maxDate.dataBalance);
        return Math.round(usage * 100) / 100;
    }

    getMaxDateStat(statistics) {
        return statistics.reduce(function (l, e) {
            return moment(e.dateTimeReceived).format("HH:mm") > moment(l.dateTimeReceived).format("HH:mm") ? e : l;
        });
    }

    getMinDateStat(statistics) {
        return statistics.reduce(function (l, e) {
            return moment(e.dateTimeReceived).format("HH:mm") < moment(l.dateTimeReceived).format("HH:mm") ? e : l;
        });
    }

    retnum(str) {
        return parseFloat(str.replace(/[^\d\.]*/g, ''));
    }
}