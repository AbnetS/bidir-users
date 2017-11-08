'use strict';

const co        = require('co');

const admins = require('./admin');

module.exports = function migrator() {
  co(function* () {
    let collection = [ admins ];

    for(let item of collection) {
      yield item();
    }

  }).then((results) => {

    console.log('---Data Migration complete---');

  }).catch((err) => {

    console.log(err);
    console.log('---Error occured during data migration---');

  });

}
