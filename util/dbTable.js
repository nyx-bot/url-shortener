const config = require('../config.json');
const { Op, Model, DataTypes } = require("sequelize");

module.exports = (conf) => {
    console.log(`Defining table "${conf}"`)

    let obj = {
        destinationURL: {
            type: DataTypes.STRING,
            defaultValue: 'https://nyx.bot/'
        },
        shortURL: {
            type: DataTypes.STRING,
            defaultValue: 'abcd',
            primaryKey: true,
        }
    };
    
    if(config.config.allowUserIdentification) {
        console.log(`Enabling user identification -- if previously disabled, existing database entries will be adjusted to have a user ID of "-1"`)
        obj.userID = {
            type: DataTypes.STRING,
            defaultValue: `-1`
        };
    } else console.log(`Omitting user identification.`);
    
    if(config.config[conf].expirationEnabled) {
        console.log(`Enabling expiration entries -- if previously disabled, existing database entries will be removed once overwritten.`)
        obj.expires = {
            type: DataTypes.INTEGER,
            defaultValue: -1,
        }
    } else console.log(`Omitting expiration entries...`)

    return obj
}