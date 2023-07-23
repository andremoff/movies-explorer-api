const dotenv = require('dotenv');

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const MONGO_DB_ADDRESS = process.env.MONGO_DB_ADDRESS || 'mongodb://127.0.0.1:27017/bitfilmsdb';

module.exports = {
  NODE_ENV,
  JWT_SECRET,
  MONGO_DB_ADDRESS,
};
