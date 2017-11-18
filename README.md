
## Sigfox Node.js Callback Demo

### Purpose

* Logs the message sent by your Sigfox objects in an SQL database
* Display a table of received messages, with their unique id, data payload and relevant metadata

This is a [Node.js](http://nodejs.org) + [hapi](https://hapijs.com) application, with three routes:

* GET / to display the dashboard
* POST /uplink to log an uplink callback
* [⚠️ WIP] `POST /downlink` to log a downlink request, and send a reply back to the device


### Installation

#### Dependencies

Before installing the app itself, check that the main dependencies are installed on your system

##### Node.js

To install, the better is probably to use [nvm (Node version manager)](https://github.com/creationix/nvm) that will let you switch between version of Node.

As of Nov 2017, the LTS version of Node.js is v8.2.1
```
$ curl https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
$ nvm install v8.2.1
$ nvm use v8.2.1
```

##### PostgreSQL

Follow the instructions on the [PostgreSQL website](postgresql.org).


#### Environnment vars

#### Env vars


* `DATABASE_URL` : URL of the PostgreSQL database. Ex `postgres://user:password@localhost/sigfox`
* `PORT`: the port your app will be listening to. Defaults to 34000

Either set them in the env, or use a config.local.js file, that will be used to populate `process.env`

File structure:
	```
	module.exports={
	  DATABASE_URL: ''
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
#### Emulate a callback

```
$ curl -X POST http://localhost:8000/uplink -H "Content-Type:application/json" -d '{"device":"1234", "data":"0", "station":"0001", "rssi":null, "duplicate":false}'
```

An entry will show up in your dashboard.
#### How to set up a Sigfox callback

* Log into your [Sigfox backend](http://backend.sigfox.com) account
* In the _device type_ section, access to the device type of the object you want to track
* In the sidebar, click on the [Callbacks](http://backend.sigfox.com/devictype/:key/callbacks) option
* Click the _New_ button
* Set your callback as following
  * Type: `DATA UPLINK`
  * Channel: `URL`
  * Url pattern :   `http://{your URL}/uplink`
  * HTTP method: `POST`
	* Content-Type : `application/json`
	* Body : `{"device":"{device}", "data":"{data}", "station":"{station}", "rssi":"{rssi}", "duplicate":"{duplicate}"}`
  * Click _OK_
