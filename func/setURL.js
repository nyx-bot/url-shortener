setVanityURL = (seq, url, vanity, uid, updateEntry) => new Promise(async (res, rej) => {
    let obj = {
        shortURL: vanity,
        destinationURL: url,
    };

    if(require(`../config.json`).config.allowUserIdentification) obj.userID = `${uid}`;
    if(require(`../config.json`).config.vanity.expirationEnabled) obj.expires = (Date.now() + require(`../config.json`).config.vanity.expiration*8.64e+7)

    let entry;

    if(updateEntry) {
        updateEntry.set(obj);
        entry = await updateEntry.save();
        res(entry && entry.dataValues ? entry.dataValues : entry || null);
    } else {
        entry = await seq.models.vanity.create(obj);
        res(entry && entry.dataValues ? entry.dataValues : entry || null);
    }
})

module.exports = (seq, url, vanity, uid, forceDefaultEntry) => new Promise(async (res, rej) => {
    if(vanity && require(`../config.json`).config.vanity.enabled && !forceDefaultEntry) {
        const existingVanity = await seq.models.vanity.findOne({
            where: {
                shortURL: vanity,
            },
        });

        if(existingVanity) {
            console.log(`Vanity exists!\nVanity: ${vanity}\nExisting: ${existingVanity.destinationURL}\nNew: ${url}`)

            if(existingVanity.expires < Date.now()) {
                console.log(`Vanity has been expired, overwriting!`)
                await seq.models.vanity.destroy({where: {shortURL: vanity}});
                setVanityURL(seq, url, vanity, uid, existingVanity).then(res).catch(rej)
            } else if(existingVanity.userID && existingVanity.userID == uid) {
                console.log(`User ID is the same as the original, overwriting!`)
                setVanityURL(seq, url, vanity, uid, existingVanity).then(res).catch(rej)
            } else rej(`This vanity URL already exists!`)
        } else setVanityURL(seq, url, vanity, uid).then(res).catch(rej)
    } else {
        const existingLocation = await seq.models.default.findOne({
            where: {
                destinationURL: url
            },
            raw: true
        });

        if(existingLocation) {
            res(existingLocation)
        } else {
            let gen = require(`../util/randomGen`)(4);
            
            while(await seq.models.vanity.findOne({where: {shortURL: gen}})) {
                const model = await seq.models.vanity.findOne({where: {shortURL: gen}});

                if(model.expires < Date.now()) {

                } else {
                    console.log(`Vanity for gen ${gen} already exists; it is expired, so we will overwrite it :)`); 
                    await seq.models.vanity.destroy({where: {shortURL: gen}});
                    gen = require('../util/randomGen')(4)
                }
            }

            let obj = {
                destinationURL: url,
                shortURL: vanity || gen
            };

            if(require(`../config.json`).config.allowUserIdentification) obj.userID = `${uid}`;
            if(require(`../config.json`).config.default.expirationEnabled) obj.expires = (Date.now() + require(`../config.json`).config.vanity.expiration*8.64e+7)

            const entry = await seq.models.default.create(obj)

            res(entry && entry.dataValues ? entry.dataValues : entry || null);
        }
    }
})