var http = require('http');
var satellite = require('satellite.js');
var deg2rad = require('deg2rad')
var rad2deg = require( 'compute-rad2deg' );

var tle = 'ISS (ZARYA)';
var tle1 = '1 25544U 98067A   18017.56432218  .00001988  00000-0  37032-4 0  9993';
var tle2 = '2 25544  51.6430  49.5975 0003729  26.4064  96.7295 15.54321824 95099';

var satrec = satellite.twoline2satrec(tle1, tle2);

var observerGd = {
    longitude: deg2rad(52.000075),
    latitude: deg2rad(-0.771512),
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


  response.az = rad2deg(lookAngles.azimuth);
  response.alt = rad2deg(lookAngles.elevation);

  res.write(JSON.stringify(response)); //write a response to the client
  res.end(); //end the response
}).listen(8080); //the server object listens on port 8080
