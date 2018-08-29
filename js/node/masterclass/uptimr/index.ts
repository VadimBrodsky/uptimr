import * as http from 'http';
import * as https from 'https';
import * as sd from 'string_decoder';
import * as url from 'url';
import * as fs from 'fs';
import config from './config';

const unifiedServer = (req, res) => {
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
};

const httpServer = http.createServer((req, res) => unifiedServer(req, res));
const httpsServer = https.createServer({
  cert: fs.readFileSync('./https/cert.pem'),
  key: fs.readFileSync('./https/key.pem'),
}, (req, res) => unifiedServer(req, res));

httpServer.listen(config.httpPort, () => {
  console.log(
    `The http server is now listening on port ${config.httpPort} in ${config.envName} mode`,
  );
});

httpsServer.listen(config.httpsPort, () => {
  console.log(
    `The https server is now listening on port ${config.httpsPort} in ${config.envName} mode`,
  );
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
  notFound: handlers.notFound,
  sample: handlers.sample,
};
