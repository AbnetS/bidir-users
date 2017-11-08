'use strict';

const co = require('co');

const Admin = require('../dal/admin');
const User  = require('../dal/user');

let adminsData = require('./data').admins;

module.exports = function migrateAdmin() {
  return co(function* () {

    for(let data of adminsData) {

      let user = yield User.get({ username: data.email });
      if(user) {
        continue;
      }

      user = yield User.create({
        username: data.email,
        password: data.password,
        role: data.role,
        realm: data.realm
      });

      // Create Admin
      let admin = yield Admin.create({
        user: user._id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number
      });

      yield User.update({ _id: user._id },{
        admin: admin._id
      })

    }

    return { message: 'done' };

  }).then((admin) => {
    console.log('>>>DONE MIGRATING ADMIN DATA<<<');
    return Promise.resolve(admin);
  }).catch((err) => {
    return Promise.reject(err);
  });
};

