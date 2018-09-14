'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const logger = require('simple-node-logger').createSimpleLogger();
const cors = require('cors');

logger.setLevel(process.env.LOG_LEVEL || 'info');


function initApp() {
    const app = express();

    // all origins allowed
    app.use(cors());
    app.use(bodyParser.json());

    // init business endpoints
    require('../lib/zombies/zombie-init')(app, logger, config);

    // error handler
    app.use(require('../lib/middlewares').errorMiddleware(logger));

    const port = config.get('port');
    app.listen(port, () => logger.info('listening on port ', port));
}

initApp();