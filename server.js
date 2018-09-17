const express = require('express');
const path = require('path');


// create the express app
var app = express();

// app.all('*', function(req, res, next) {
//   var origin = req.get('origin');
//   res.header('Access-Control-Allow-Origin', origin);
//   res.header('Access-Control-Allow-Headers', 'X-Requested-With');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

// app.use(basicauth('birdie', 'puffin'));

app.use(express.static(path.join(__dirname, 'www'))); //  "public" off of current is root

app.get('*', function(req, res) {
  res.sendFile(path.resolve(__dirname, 'www/index.html'));
});

// kick off the app
var port = process.env.PORT || 5000;
app.listen(port);

console.log(`Node Env: ${process.env.NODE_ENV}`);
console.log(`server started on port: ${port}`);
