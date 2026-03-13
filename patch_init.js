const fs = require('fs');

const path = 'src/app/api/user/init/route.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `return NextResponse.json({ error: 'Internal server error' }, { status: 500 });`,
  `return NextResponse.json({ error: 'Internal server error', details: error.message || String(error) }, { status: 500 });`
);

fs.writeFileSync(path, content);
console.log('patched');
