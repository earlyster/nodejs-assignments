/**
 * Primary file for the API
 */

// Dependencies
import { createServer } from 'http';
import { createServer as _createServer } from 'https';
import { parse } from 'url';
import { StringDecoder } from 'string_decoder';
import { readFileSync } from 'fs';
import { httpPort, envName, httpsPort } from './config.mjs';

// Creating http server
const httpServer = createServer((req, res) => {
    unifiedServer(req, res);
});

// Server will continue to run and listen to port
httpServer.listen(httpPort, () => {
    console.log(`server listening to port ${httpPort} in ${envName} mode`);
});

// Creating https (SSL) server
const httpsServerOptions = {
    key: readFileSync('./https/key.pem'),
    cert: readFileSync('./https/cert.pem')
};
const httpsServer = _createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

// Server will continue to run and listen to port
httpsServer.listen(httpsPort, () => {
    console.log(`server listening to port ${httpsPort} in ${envName} mode`);
});

// start the https server


// All the server logic for http / https
const unifiedServer = (req, res) => {
    // get url and parse it
    var parsedUrl = parse(req.url, true);
    // get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // get query string object
    var queryString = parsedUrl.query;

    // get the http method
    var method = req.method.toLowerCase();

    // get the headers as an object
    var headers = req.headers;

    // get the payload if there is any
    var decoder = new StringDecoder('utf-8');
    var payloadBuffer = '';
    req.on('data', (data) => {
        payloadBuffer += decoder.write(data);
    })
    req.on('end', () => {
        payloadBuffer += decoder.end();
        // choose the handler this request should go to
        // if not found use notFound handler

        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        // construct data object for the handler
        var data = {
            trimmedPath: trimmedPath,
            queryString: queryString,
            method: method,
            headers: headers,
            payload: payloadBuffer
        };
        // route request to the handler specified in the router
        chosenHandler(data, function (statusCode, responsePayload) {
            // use the status code called back by the handler or default to 200
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;
            // use the payload callback or use empty object
            responsePayload = typeof (responsePayload) === 'object' ? responsePayload : {};

            // convert payload to string
            var responsePayloadString = JSON.stringify(responsePayload);

            // send response for json only -- router only handles json responses 
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(responsePayloadString);
            // log the path
            console.log('path', trimmedPath, 'method', method, 'query string', queryString, 'headers', headers, 'payload', payloadBuffer, 'statusCode', statusCode, 'resPayLoad', responsePayloadString);
        })
    })

};

// defining handlers
const handlers = {};

// defining sample handler
handlers.hello = (data, callback) => {
    // call back http status code, and a payload object
    callback(200, { message: 'hello world' });
};
// define not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

// defining router
const router = {
    hello: handlers.hello,
};
