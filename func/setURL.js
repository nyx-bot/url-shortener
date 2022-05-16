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

module.exports = (seq, url, vanity, uid) => new Promise(async (res, rej) => {
    if(vanity) {
        const existingVanity = await seq.models.vanity.findOne({
            where: {
                shortURL: vanity,
            },
        });

        if(existingVanity) {
            console.log(`Vanity exists!\nVanity: ${vanity}\nExisting: ${existingVanity.destinationURL}\nNew: ${url}`)

            if(existingVanity.expires < Date.now()) {
                console.log(`Vanity has been expired, overwriting!`)
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
            let obj = {
                destinationURL: url,
                shortURL: require(`../util/randomGen`)(4)
            };

            if(require(`../config.json`).config.allowUserIdentification) obj.userID = `${uid}`;
            if(require(`../config.json`).config.default.expirationEnabled) obj.expires = (Date.now() + require(`../config.json`).config.vanity.expiration*8.64e+7)

            const entry = await seq.models.default.create(obj)

            res(entry && entry.dataValues ? entry.dataValues : entry || null);
        }
    }
})