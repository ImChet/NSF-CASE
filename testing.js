const express = require('express');
const hostname = '127.0.0.1';
const port = 3000;

const server = express();

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});