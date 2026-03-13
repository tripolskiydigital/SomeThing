const fs = require('fs');

const path = 'src/app/api/user/init/route.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `error.message`,
  `(error as Error).message`
);

fs.writeFileSync(path, content);
console.log('patched');
