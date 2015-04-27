'use strict';

const debug = require('debug')('sigfox-callback:db');
const mongo = require('mongojs');
const format = require('util').format;
const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/sigfox-callback';

module.exports = {
  db : undefined,
  connect : function() {
    this.db = mongo(dbUrl, ['calls']);
    
    this.db.on('error', function(err){
      debug('DB Error - %s', err);
    });
    this.db.on('ready', function(){
      debug('DB ready');
    });
    
    return;
  },
  insert: function(collectionName, data){
    debug('Insert %o in %s', data, collectionName);
    return new Promise(function(resolve, reject){
      this.db[collectionName].insert(data, function(err, docs){
        if (err){
          debug('Insert err — %s', err);
          return reject(err);
        }
        return resolve(docs);
      });
    }.bind(this));
  },
  /**
  * Find documents in a given collection
  * 
  * @param {String} collectionName — name of the collection to look into
  * @param {Object} qry — The filter
  * @param {Object} options
  * @return {Promise}
  */
  find: function(collectionName, qry, options){
    if (!options){
      options = {};
    }
    return new Promise(function(resolve, reject){
      const sort = options.sort || {};
      const limit = options.limit || 100;
      const skip = options.skip || 0;
      delete options.sort;
      delete options.limit;
      
      this.db[collectionName]
      .find(qry, options)
      .sort(sort)
      .limit(limit)
      .toArray(function(err, docs){
        if (err){
          debug('Find err — %s', err);
          return reject(err);
        }
        return resolve(docs);
      });
    }.bind(this));
  }
};