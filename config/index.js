'use strict';

/**
 * Load Module dependencies.
 */
const path = require('path');

const env = process.env;

const PORT        = env.PORT || 8030;
const API_URL     = env.API_URL || 'http://127.0.0.1:8030';
const NODE_ENV    = env.NODE_ENV || 'development';
const HOST        = env.HOST_IP || 'localhost';

const MONGODB_URL = env.MONGODB_URL || 'mongodb://127.0.0.1:27017/bidir';

const DEFAULT_USER_PWD = "pass2acat"

let config = {

  // Root Configs
  API_URL: API_URL,

  ENV: NODE_ENV,

  PORT: PORT,

  HOST: HOST,


  MONGODB: {
    URL: MONGODB_URL,
    OPTS: {
      server:{
        auto_reconnect:true
      }
    }
  },

  CORS_OPTS: {
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization'
  },

  SALT_FACTOR: 12,

  TOKEN: {
    RANDOM_BYTE_LENGTH: 32
  },


  ASSETS: {
    FILE_SIZE: 2 * 1024 * 1024, // 1MB,
    URL: API_URL + '/media/',
    DIR: path.resolve(process.cwd(), './assets') + '/',
    PROD: 'http://api.bidir.gebeya.co/assets/',
    DEV: 'http://api.dev.bidir.gebeya.co/assets/'
  },
  
  GOOGLE_BUCKETS: {
    ACCESS_ID: 'bidir-bucket-access@los-bidir.iam.gserviceaccount.com',
    KEY: path.join(__dirname, '../config/google-buckets.pem')
  },

  DEFAULT_USER_PWD: DEFAULT_USER_PWD
};

module.exports = config;
