/*
 * Primary file for the API
 *
 */
import * as http from 'http';
import * as sd from 'string_decoder';
import * as url from 'url';

const server = http.createServer((req, res) => {
  // get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // get the path
  const { pathname } = parsedUrl;
  const trimmedPath = pathname.replace(/^\/+|\/+$/g, '');

  // get the HTTP method
  const method = req.method.toLowerCase();

  // get the query string as an object
  const { query } = parsedUrl;

  // get the headers as an object
  const { headers } = req;

  // get the payload if any
  const decoder = new sd.StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // send the respose
    res.end('Hello World\n');

    // log the response back
    console.log(
      `Request received on path ${trimmedPath} with ${method} method with ${JSON.stringify(
        query,
      )} parameters, headers: ${JSON.stringify(headers)}`,
    );
  });
});

server.listen(3000, () => {
  console.log('The server is now listening on port 3000');
});
