'use strict';

const express = require('express');
const middlewares = require('../middlewares');

// initializes express routes
function init(zombieHandlers, itemsHandlers) {
    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/zombies', zombieHandlers.get);
    router.post('/zombies', middlewares.jsonContentMiddleware, zombieHandlers.post);

    router.get('/zombies/:id', zombieHandlers.getSingle);
    router.delete('/zombies/:id', zombieHandlers.deleteSingle);
    router.put('/zombies/:id', middlewares.jsonContentMiddleware, zombieHandlers.putSingle);


    router.get('/zombies/:id/items', itemsHandlers.get);
    router.post('/zombies/:id/items/:itemId', itemsHandlers.post);
    router.delete('/zombies/:id/items/:itemId', itemsHandlers.post);

    return router;
}


module.exports.init = init;
