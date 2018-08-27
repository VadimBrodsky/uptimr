/*
 * Primary file for the API
 *
 */
const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello World\n');
});

server.listen(3000, () => {
  console.log('The server is now listening on port 3000');
})
