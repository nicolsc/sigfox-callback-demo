'use strict';
require('./loadConfig.js');
const Hapi = require('hapi');
const server = new Hapi.Server();
server.connection({
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 8000
});

const { Pool } = require('pg')
const pool = new Pool()


pool.connect((err, client, done) => {
  if (err){
    console.log("⚠️ Unable to connect to the database", err.stack);
    process.exit(1);
  }

  const home = function (request, reply){
    client.query("select * from callbacks order by date desc")
    .then(res => {
      reply.view('list', {rows:res.rows});
    })
    .catch(e=>console.log(e.stack));
  };
  const uplinkCallback = function (request, reply){
    reply('Callback received').code(200);
    recordCallback('data/uplink', request);
  };
  const downlinkCallback = function (request, reply){
    reply('Downlink request received').code(200);
    recordCallback('data/downlink', request);
  };

  const recordCallback = (type, request) => {

    const qry = "INSERT INTO callbacks(date, type, device, data, stationId, rssi, duplicate) VALUES(now(), $1, $2, $3, $4, $5, $6) RETURNING id";
    client.query(qry, [type, request.payload.device, request.payload.data, request.payload.station, request.payload.rssi, request.payload.duplicate])
    .then(res => {

      console.log("• New record #",res.rows.pop().id);
    })
    .catch(err => {
      console.log("SQL Err", err.stack);
    })
  };
  server.route({
      method: 'GET',
      path:'/',
      handler: home
  });
  server.route({
      method: 'POST',
      path:'/uplink',
      handler: uplinkCallback
  });
  server.route({
      method: 'POST',
      path:'/downlink',
      handler: downlinkCallback
  });
  server.register(require('vision'), (err) => {
    if (err) throw err;
    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'views'
    });
    server.start((err) => {
      if (err) {
          throw err;
      }
      console.log('Server running at:', server.info.uri);
    });
  });
});
