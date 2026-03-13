const fs = require('fs');

const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `  const handleGenerateInvite = async () => {
    try {
      const res = await fetch('/api/couple/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.coupleId) {
        setGeneratedInvite(data.coupleId);
        setCoupleId(data.coupleId);
        localStorage.setItem('coupleId', data.coupleId);
      }
    } catch (err) {
      console.error(err);
    }
  };`,
  `  const handleGenerateInvite = async () => {
    try {
      const res = await fetch('/api/couple/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      
      if (res.status === 404 && data.error === 'User not found') {
        localStorage.removeItem('userId');
        window.location.reload();
        return;
      }
      
      if (data.coupleId) {
        setGeneratedInvite(data.coupleId);
        setCoupleId(data.coupleId);
        localStorage.setItem('coupleId', data.coupleId);
      }
    } catch (err) {
      console.error(err);
    }
  };`
);

fs.writeFileSync(path, content);
console.log('patched');
