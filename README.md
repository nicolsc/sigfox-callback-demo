
## Sigfox Node.js Callback Demo

### Purpose

* Logs the message sent by your Sigfox objects in an SQL database
* Display a table of received messages, with their unique id, data payload and relevant metadata

This is a [Node.js](http://nodejs.org) + [hapi](https://hapijs.com) application, with three routes:

* `GET /` to display the dashboard
* `POST /uplink` to log an uplink callback
* `POST /downlink` to log a downlink request, and send a reply back to the device


### Installation

#### Dependencies

Before installing the app itself, check that the main dependencies are installed on your system

##### Node.js

To install, the better is probably to use [nvm (Node version manager)](https://github.com/creationix/nvm) that will let you switch between version of Node.

As of Nov 2017, the LTS version of Node.js is v8.2.1

##### PostgreSQL

Follow the instructions on the [PostgreSQL website](postgresql.org).


#### Environnment vars

#### Env vars


* `DATABASE_URL` : URL of the PostgreSQL database. Ex `postgres://user:password@localhost/sigfox`
* `PORT`: the port your app will be listening to. Defaults to 8000

Either set them in the env, or use a config.local.js file, that will be used to populate `process.env`

File structure:
	```
	module.exports={
	  DATABASE_URL: 'postgres://user:password@localhost/sigfox'
	};
	```


#### Install

````
$ npm install
````

A post install script will init a `callbacks` database



### Test requests

#### Check your dashboard

Navigate to http://localhost:8000/ in your browser.

Table will be empty by default
#### Uplink callback

```
$ curl -X POST http://localhost:8000/uplink -H "Content-Type:application/json" -d '{"device":"1234", "data":"0", "station":"0001", "rssi":null, "duplicate":false}'
```

#### Downlink callback
```
$ curl -X POST http://localhost:8000/downlink -H "Content-Type:application/json" -d '{"device":"1234", "data":"0", "station":"04E0", "rssi":-122, "duplicate":false}'
```

### Callback setup on Sigfox Cloud

* Log into your [Sigfox backend](http://backend.sigfox.com) account
* In the _device type_ section, access to the device type of the object you want to track
* In the sidebar, click on the [Callbacks](http://backend.sigfox.com/devicetype/:devicetypeid/callbacks) option
* Click the _New_ button
* Choose "Custom callback"

![Callback type selection](./screenshots/callback-type.png)

#### Uplink

Set your callback as following
  * Type: `DATA UPLINK`
  * Channel: `URL`
  * Url pattern :   `http://{your URL}/uplink`
  * HTTP method: `POST`
	* Content-Type : `application/json`
	* Body : `{"device":"{device}", "data":"{data}", "station":"{station}", "rssi":"{rssi}", "duplicate":"{duplicate}"}`
  * Click _OK_


![Uplink Callback configuration](./screenshots/uplink-configuration.png)

#### Downlink
Set your callback as following:

  * Type: `DATA BIDIR`
  * Channel: `URL`
  * Url pattern :   `http://{your URL}/uplink`
  * HTTP method: `POST`
	* Content-Type : `application/json`
	* Body : `{"device":"{device}", "data":"{data}", "station":"{station}", "rssi":"{rssi}", "duplicate":"{duplicate}"}`
  * Click _OK_

![Downlink Callback configuration](./screenshots/downlink-configuration.png)

By default, new _downlink callbacks_ are inactive.  
You need to explicitly activate them, by clicking on the empty disc in the _Downlink_ column

![Downlink Enablement](./screenshots/downlink-enablement.png)
![Downlink Activation](./screenshots/downlink-activation-popup.png)

Once activated, your downlink callback will have a blue disk displayed in the _Downlink_ column:
![Downlink Activation](./screenshots/downlink-active.png)

### Easy deploy to Heroku

If you have an [Heroku](http://heroku.com) account, you can easily deploy this demo application online:
* Create a new application
* Attach a PostgreSQL addon. This will populate the `DATABASE_URL` env var, pointing to your new database
* Deploy the application & start it
```
	$ heroku apps:create
	$ heroku addons:create heroku-postgresql:hobby-dev
	$ git push heroku master
	$ heroku ps:scale web=1
	$ heroku open
```

### Nota bene

This tutorial aims to help you discover the uplink and downlink capabilities.

Please, be aware __messages will be duplicated__ in the PostgreSQL database as the message "data" is saved when both _uplink_ and _downlink_ callbacks are called.

You could only use the __BIDIR__ callback which enables to:
* save the uplink frame in a database (using the "data" parameter containing the payload)
* send a downlink frame to a device by filtering the __"ack"__ boolean parameter (which tells if the device is asking for one)


