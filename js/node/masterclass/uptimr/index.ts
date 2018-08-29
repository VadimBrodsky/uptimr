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

    // log the response back
    console.log(
      'REQ:',
      method,
      '/',
      trimmedPath,
      '?',
      JSON.stringify(query),
      'headers',
      JSON.stringify(headers),
    );

    // route to the correct handler
    const currentHandler = router[trimmedPath] ? router[trimmedPath] : router.notFound;

    // construct the payload for the handler
    const data = {
      headers,
      method,
      payload: buffer,
      query,
      trimmedPath,
    };

    // route the request
    currentHandler(data, (statusCode = 200, payload = {}) => {
      const payloadString = JSON.stringify(payload);
      // send the respose
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // log the response
      console.log('RES:', statusCode, payloadString);
    });
  });
});

server.listen(3000, () => {
  console.log('The server is now listening on port 3000');
});

const handlers = {
  sample(data, callback) {
    callback(406, { name: 'sample handler' });
  },
  notFound(data, callback) {
    callback(404);
  },
};

const router = {
  sample: handlers.sample,
  notFound: handlers.notFound,
};
