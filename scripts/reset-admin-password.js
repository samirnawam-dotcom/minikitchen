'use strict';

// Resets the Back Office administrator password and signs out all sessions.
//   node scripts/reset-admin-password.js 'NEW-PASSWORD'
const security = require('../src/security');
const store = require('../src/db');

async function main() {
  const password = process.argv[2];
  const problem = security.validateNewPassword(password);
  if (problem) throw new Error(problem);

  await store.init();
  const auth = store.getAdminAuth();
  const hashed = await security.hashPassword(password);
  store.saveAdminAuth({
    ...auth,
    salt: hashed.salt,
    passwordHash: hashed.hash,
    iterations: hashed.iterations,
    mustChangePassword: false,
    passwordChangedAt: new Date().toISOString()
  });
  store.deleteOtherSessions('');
  store.logAudit('system', 'auth.password_reset', 'Password reset from the command line');
  store.close();
  console.log(`Password updated for '${auth.username}'. All sessions were signed out.`);
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
