const path = require('path');
const express = require("express");
const dotenv = require("dotenv");
const app = express();
dotenv.config()

// global container
const server = {};

// set static folder
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

const port = process.env.FRONTEND_PORT || 3000;

server.init = function() {
  app.listen(port, function() {
    console.log(`server listening http://localhost:${port}`)
  });
}

server.init();