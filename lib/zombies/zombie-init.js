'use strict';

const routes = require('./zombie-routes');
const handlersFactory = require('./zombie-handler');
const itemsHandlersFactory = require('./zombie-items-handler');
const zombieSvcFac = require('./zombie-service');
const marketCacheFactory = require('./market-cache');
const itemsSvcFactory = require('./items-service');

// creates all basic object necessary for application to run
module.exports = (app, logger, config) => {
    logger.debug('started init of zombies crud');

    const marketCache = marketCacheFactory.create(logger, config.market);
    const itemsSvc = itemsSvcFactory.create(logger, config.exchange);
    const zombieSvc = zombieSvcFac.create(logger, itemsSvc, marketCache);

    const zombieHandlers = handlersFactory.create(logger, zombieSvc);
    const itemsHandler = itemsHandlersFactory.create(logger, zombieSvc);

    logger.debug('initializing zombie routes');
    app.use(routes.init(zombieHandlers, itemsHandler));
};
