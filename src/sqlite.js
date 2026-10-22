'use strict';

// Opens the SQLite database with Node's built-in driver (node:sqlite, Node >= 22.13) and falls back
// to the better-sqlite3 package on older Node versions, e.g. hosting panels that only offer Node 20.
// Both expose the same synchronous API used by db.js: exec(), prepare().get/all/run(), close().

function loadDriver() {
  if (process.env.SQLITE_DRIVER !== 'better-sqlite3') {
    try {
      const { DatabaseSync } = require('node:sqlite');
      return { name: 'node:sqlite', open: file => new DatabaseSync(file) };
    } catch (err) {
      if (err.code !== 'ERR_UNKNOWN_BUILTIN_MODULE' && err.code !== 'MODULE_NOT_FOUND') throw err;
    }
  }
  try {
    const Database = require('better-sqlite3');
    return { name: 'better-sqlite3', open: file => new Database(file) };
  } catch (err) {
    throw new Error(
      `No SQLite driver available on Node ${process.version}. Use Node >= 22.13, or run "npm install" ` +
        `so the better-sqlite3 package is installed. (${err.message})`
    );
  }
}

const driver = loadDriver();

module.exports = { driverName: driver.name, openDatabase: driver.open };
