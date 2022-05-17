module.exports = async (seq, func) => {
    const config = require(`./config.json`)

    console.log(`Starting webserver!`);

    const fastify = require('fastify')({ logger: true });

    fastify.get(`/:id`, async (req, res) => {
        const shortURL = req.params.id;
        
        try {
            const entry = await func.getURL(seq, shortURL);
            console.log(entry.destinationURL)
            res.redirect(301, entry.destinationURL)
        } catch(e) {
            console.log(`${shortURL} - ${e}`)
            res.code(404).send(`Not found`)
        }
    });

    const parseEntry = (entry, type) => {
        let obj = {
            destination: entry.destinationURL,
            shortURL: entry.shortURL,
        }

        if(config.config.allowUserIdentification) obj.user = entry.userID
        if(config.config[type].expirationEnabled) obj.expires = entry.expires
        obj.created = new Date(entry.createdAt).getTime();
        obj.lastUpdated = new Date(entry.updatedAt).getTime();

        return obj;
    };

    const reverseParse = (obj) => {
        let res = {};

        if(obj.destination) res.destinationURL = obj.destination;
        if(obj.shortURL) res.shortURL = obj.shortURL;
        if(obj.user) res.userID = obj.user;
        if(obj.expires) res.expires = obj.expires;
        if(obj.created) res.createdAt = new Date(obj.created);
        if(obj.lastUpdated) res.updatedAt = new Date(obj.lastUpdated);

        return res;
    }

    fastify.post(`/api/shorten`, async (req, res) => {
        if(config.apiKey) {
            if(!req.headers.authorization || req.headers.authorization != config.apiKey) return res.code(403).send(`Unauthorized`)
        }

        if(req.body && typeof req.body == `object`) {
            if(!req.body.destination) return res.code(400).send(`No destination link!`)
            if(config.config.allowUserIdentification && !req.body.user) return res.code(400).send(`No user identifier provided!`);

            if(config.config.vanity.enabled && req.body.shortURL) {
                if(req.body.shortURL.length < 5) return res.code(400).send(`Vanity URLs must be greater than or equal to 5 characters in length!`);
                if(typeof config.config.vanity.maximumCharacterLength == `number` && req.body.shortURL.length > config.config.vanity.maximumCharacterLength) return res.code(400).send(`Exceeds maximum character length! (${config.config.vanity.maximumCharacterLength})`)
                if(req.body.shortURL.match(/^[a-zA-Z0-9_]*$/)) {
                    func.setURL(seq, req.body.destination, req.body.shortURL, config.config.allowUserIdentification ? req.body.user : null).then(o => res.send(parseEntry(o, `vanity`))).catch(e => res.code(403).send(e))
                } else {
                    return res.code(400).send(`Vanity links must be alphanumeric!`)
                }
            } else func.setURL(seq, req.body.destination, null, config.config.allowUserIdentification ? req.body.user : null).then(o => res.send(parseEntry(o, `default`))).catch(e => res.code(403).send(e))
        } else res.code(400).send(`Must send an application/json payload!`)
    })

    fastify.post(`/api/find`, async (req, res) => {
        if(config.apiKey) {
            if(!req.headers.authorization || req.headers.authorization != config.apiKey) return res.code(403).send(`Unauthorized`)
        }

        if(req.body && typeof req.body == `object`) {
            if(Object.keys(req.body).length < 1) return res.code(400).send(`No keys provided!`);

            let results = [];

            const def = await seq.models.default.findAll({
                raw: true,
                where: reverseParse(req.body)
            });

            const van = await seq.models.vanity.findAll({
                raw: true,
                where: reverseParse(req.body)
            });

            def.forEach(entry => results.push(parseEntry(entry, `default`)))
            van.forEach(entry => results.push(parseEntry(entry, `vanity`)))

            return res.send(results)
        } else res.code(400).send(`Must send an application/json payload!`)
    })

    fastify.listen(require('./config.json').port).then(() => {
        console.log(`Service is now active!`)
    })
}