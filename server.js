'use strict';
/**
* Load local config to env
*/
try{
  const localConfig = require('./config.local.js');
  for (let entry in localConfig){
    if (process.env[entry]){
      console.log('%s found in process.env too, ignore the local config val\n\t env vars always have precedence', entry); 
    }
    else{
      process.env[entry] = localConfig[entry];
    }
  }
}
catch(e){
 console.log('No local config found'); 
  console.log(e);
}

const debug = require('debug')('sigfox-callback:app');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
/* init */
const app = express();
const port = process.env.PORT || 34000;
const server = http.createServer(app);
const db = require('./modules/db');
const requestLogger = require('./middlewares/requestLogger');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.locals.moment = require('moment');


db.connect();
server.listen(port);

app.get('/', function(req, res){
  debug('Looking for logs');
  db.find('calls', {path:'/sigfox', payload:{$exists:true}}, {sort:{time:-1}})
  .then(function(data){
    debug('%s items found', data.length);
    res.format({
        /* JSON first */
        json: function(){
            res.json({entries:data});
        },
        html: function(){
            res.render('sigfox-logs', {title:'SIGFOX messages', entries:data});        
        },
        default:function(){
            res.status(406).send({err:'Invalid Accept header. This method only handles html & json'});
        }
    });
  })
  .catch(function(err){
    res.format({
      json: function(){
          return res.json({err:'An error occured while fetching messages', details:err});
      },
      html: function(){
            return res.status(500).render('error', {title:'An error occured while fetching messages', err:err});
        },
      default: function(){
        res.status(406).send({err:'Invalid Accept header. This method only handles html & json'});
      }
    });
  });
});


app.post('/sigfox', requestLogger, function(req, res){
  debug('~~ POST request ~~');
  res.json({result:'♡'});
});
  


server.on('error', function(err){
    debug('ERROR %s', err);
});
server.on('listening', function(){
 debug('Server listening on port %s', port); 
});