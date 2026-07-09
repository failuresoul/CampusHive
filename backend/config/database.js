const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Use SQLite by default so the app works without a MySQL installation.
// Set DB_DIALECT=mysql in .env (and fill in DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
// if you want to connect to a real MySQL server instead.
const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'campushive',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false,
    }
  );
} else {
  // SQLite — stores everything in a local file, no server needed
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'campushive.sqlite'),
    logging: false,
  });
}

module.exports = sequelize;
