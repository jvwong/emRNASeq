'use strict';

const path = require('path');
const express = require('express');

// Constants
const PORT = 8080;

// App
const app = express();
app.use('/media', express.static('media'))
app.use('/public', express.static('public'))
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
