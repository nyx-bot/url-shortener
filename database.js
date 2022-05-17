module.exports = () => new Promise(async (res) => {
    const { Sequelize } = require("sequelize");
    const config = require('./config.json');
    const fs = require('fs')

    const seq = new Sequelize({
        dialect: "sqlite",
        storage: "database.db",
        logging: false,
        maxConcurrentQueries: 100,
    });

    try {
        await seq.authenticate();
        console.log(`Authenticated to DB!`);
        ready = true;
    } catch (e) {
        return console.error(`Unable to authenticate to DB! // ${e}`, e);
    }

    seq.define('default', require(`./util/dbTable`)(`default`))
    if(config.config.vanity.enabled) seq.define('vanity', require(`./util/dbTable`)(`vanity`))
     
    const sync = require('./util/synchronizeDatabase');

    sync(seq).then(() => res(seq))
})