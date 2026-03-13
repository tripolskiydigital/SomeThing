const fs = require('fs');
const crypto = require('crypto');
const tarGzPath = 'minimal.tar.gz';
const data = fs.readFileSync(tarGzPath).toString('base64');

// chunk it into lines of 1000 characters
const chunks = data.match(/.{1,1000}/g);

fs.writeFileSync('base64_chunks.txt', chunks.join('\n'));
console.log('Chunks written to base64_chunks.txt');
