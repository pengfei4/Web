const { initDB, getDB, queryAll, runSQL, saveDB } = require('./db');

(async () => {
  await initDB();
  const db = getDB();

  // Add role column if missing
  const cols = queryAll("PRAGMA table_info(users)");
  const hasRole = cols.some(c => c.name === 'role');
  if (!hasRole) {
    db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    console.log('Added role column');
  }

  // Set admin role
  runSQL("UPDATE users SET role = 'admin' WHERE username = 'admin'");
  runSQL("UPDATE users SET role = 'user' WHERE username != 'admin'");

  // Verify
  const users = queryAll("SELECT id, username, role FROM users");
  console.log('Users:');
  users.forEach(u => console.log('  ' + u.id + '. ' + u.username + ' (' + u.role + ')'));

  saveDB();
  console.log('Migration done');
})();
