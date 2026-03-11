async function runTests() {
  const BASE_URL = 'http://localhost:3000';

  console.log('Testing User Init...');
  const initRes1 = await fetch(`${BASE_URL}/api/user/init`, { method: 'POST' });
  const user1 = await initRes1.json();
  console.log('User 1:', user1.id);

  const initRes2 = await fetch(`${BASE_URL}/api/user/init`, { method: 'POST' });
  const user2 = await initRes2.json();
  console.log('User 2:', user2.id);

  console.log('\nTesting Couple Invite...');
  const inviteRes = await fetch(`${BASE_URL}/api/couple/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user1.id })
  });
  const couple = await inviteRes.json();
  console.log('Couple ID:', couple.coupleId);

  console.log('\nTesting Couple Join...');
  const joinRes = await fetch(`${BASE_URL}/api/couple/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user2.id, coupleId: couple.coupleId })
  });
  const joinData = await joinRes.json();
  console.log('Join result:', joinData);

  console.log('\nTesting Preferences (User 1 likes A, User 2 wants to try A)...');
  await fetch(`${BASE_URL}/api/user/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user1.id, preferences: ['A'], wantToTry: [] })
  });
  await fetch(`${BASE_URL}/api/user/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user2.id, preferences: [], wantToTry: ['A', 'B'] })
  });

  console.log('\nTesting Status Update (Both ready for 1 hour)...');
  await fetch(`${BASE_URL}/api/user/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user1.id, hoursReady: 1 })
  });
  await fetch(`${BASE_URL}/api/user/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user2.id, hoursReady: 1 })
  });

  console.log('\nTesting Couple State...');
  const stateRes = await fetch(`${BASE_URL}/api/couple/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user1.id, coupleId: couple.coupleId })
  });
  const state = await stateRes.json();
  console.log('Final State for User 1:');
  console.log(JSON.stringify(state, null, 2));

  console.log('\nTests Complete.');
}

// Wait for server to start, then test
setTimeout(runTests, 3000);
