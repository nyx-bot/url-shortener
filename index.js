const seqInit = require('./database')();
const fs = require('fs');

const funcList = fs.readdirSync(`./func`);
const func = {}

for(f in funcList) func[funcList[f].slice(0, -3)] = require(`./func/${funcList[f]}`);

seqInit.then(seq => require('./webserver')(seq, func))