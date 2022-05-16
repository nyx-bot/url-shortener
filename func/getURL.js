module.exports = (seq, url) => new Promise(async (res, rej) => {
    if(url.length === 4) {
        const entry = await seq.models.default.findOne({
            raw: true,
            where: {
                shortURL: url
            }
        });
    
        if(entry) return res(entry);
    };

    const vanity = await seq.models.vanity.findOne({
        raw: true,
        where: {
            shortURL: url
        }
    });

    if(vanity) return res(vanity);

    rej(`No URL has been found!`)
})