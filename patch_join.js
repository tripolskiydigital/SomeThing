const fs = require('fs');

const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `  const handleJoinCouple = async () => {
    try {
      const res = await fetch('/api/couple/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coupleId: inviteCode })
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.success) {
        setCoupleId(data.coupleId);
        localStorage.setItem('coupleId', data.coupleId);
      }
    } catch (err) {
      setError('Failed to join couple');
      console.error(err);
    }
  };`,
  `  const handleJoinCouple = async () => {
    try {
      const res = await fetch('/api/couple/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coupleId: inviteCode })
      });
      const data = await res.json();
      
      if (res.status === 404 && data.error === 'User not found') {
        localStorage.removeItem('userId');
        window.location.reload();
        return;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.success) {
        setCoupleId(data.coupleId);
        localStorage.setItem('coupleId', data.coupleId);
      }
    } catch (err) {
      setError('Failed to join couple');
      console.error(err);
    }
  };`
);

fs.writeFileSync(path, content);
console.log('patched');
