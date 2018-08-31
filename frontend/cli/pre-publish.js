const fs = require('fs')

//copy intent library to demo directory
fs.createReadStream('./node_modules/intent-id-stellar-expert/lib/intent.id.stellar.expert.js')
    .pipe(fs.createWriteStream('./public/demo/intent.id.stellar.expert.js'))