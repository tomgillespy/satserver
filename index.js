var http = require('http');
var satellite = require('satellite.js');
var deg2rad = require('deg2rad')
var rad2deg = require( 'compute-rad2deg' );
var moment = require('moment');
var formatcoords = require('formatcoords');

var tle = 'ISS (ZARYA)';
//var tle = 'TIANGONG 1';
var tle1 = '1 25544U 98067A   18025.64405705  .00016717  00000-0  10270-3 0  9015';
var tle2 = '2 25544  51.6395   9.3206 0003787  42.7806 317.3641 15.54221535 16345';

var satrec = satellite.twoline2satrec(tle1, tle2);

var observerGd = {
    longitude: deg2rad(52.0406),
    latitude: deg2rad(-0.7594),
    height: 0.170
};

//create a server object:
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  var response = {};

  var positionAndVelocity = satellite.propagate(satrec, new Date());
  var positionEci = positionAndVelocity.position,
      velocityEci = positionAndVelocity.velocity;
  var gmst = satellite.gstime(new Date());


  var positionEcf   = satellite.eciToEcf(positionEci, gmst),
      observerEcf   = satellite.geodeticToEcf(observerGd),
      positionGd    = satellite.eciToGeodetic(positionEci, gmst),
      lookAngles    = satellite.ecfToLookAngles(observerGd, positionEcf);

  var longitude = positionGd.longitude,
      latitude  = positionGd.latitude,
      height    = positionGd.height;

  response.date = moment().format("ddd Do MMM YYYY");
  response.time = moment().format("HH:mm:ss");
  response.tle1 = tle1;
  response.tle2 = tle2;
  response.name = tle;
  response.az = rad2deg(lookAngles.azimuth);
  response.alt = rad2deg(lookAngles.elevation);

  response.position = formatcoords(rad2deg(latitude), rad2deg(longitude)).format();
  response.height = height;

  response.range = lookAngles.rangeSat;

  //response.alt = 0;


  res.write(JSON.stringify(response)); //write a response to the client
  res.end(); //end the response
}).listen(8080); //the server object listens on port 8080
