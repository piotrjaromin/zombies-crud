'use strict';

const httpClient = require('axios');

const routes = require('./zombie-routes');
const handlersFactory = require('./zombie-handler');
const itemsHandlersFactory = require('./zombie-items-handler');
const zombieSvcFac = require('./zombie-service');
const marketCacheFactory = require('./market-cache');
const itemsSvcFactory = require('./items-service');


module.exports = (app, logger, config) => {
    logger.debug('started init of zombies crud');

    const marketCache =  marketCacheFactory.create(logger, config.market, httpClient);
    const itemsSvc = itemsSvcFactory.create(logger, config.exchange, httpClient);
    const zombieSvc = zombieSvcFac.create(logger, itemsSvc, marketCache);

    const zombieHandlers = handlersFactory.create(logger, zombieSvc);
    const itemsHandler = itemsHandlersFactory.create(logger, zombieSvc);

    logger.debug('initializing zombie routes');
    app.use(routes.init(zombieHandlers, itemsHandler));
}