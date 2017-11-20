require('./loadConfig.js');

const { Pool, Client } = require('pg');
const client = new Client({
  connectionString:process.env.DATABASE_URL
});
const sql = require('fs').readFileSync('./init.sql', {encoding:'utf-8'});
client.connect(function(err){
  if (err){
    console.error("⚠️\tUnable to connect to ",process.env.DATABASE_URL);
    process.exit(1);
  }
  client.query(sql, function(err, result){
    if (err){
      console.warn("⚠️",err);
    }
    else{
      console.log(result)
      console.log("✅\tDatabase init succesful");
    }
    process.exit(0);
  });

});
