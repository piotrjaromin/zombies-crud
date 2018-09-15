'use strict';

const axios = require('axios');

/**
 * @typedef {Object} MarketCache
 * @property {function} get given id as input will return item with price and its name
 */

/**
 * By using interval value passed from config it wll refresh
 * internal items map with items fetched from external api
 * if fetch fails then we will use stale(old) data
 * calling create is not blocking that means that right after cache creation map can be empty,
 * until first request to external api finishes
 * @param {Object} logger
 * @param {Object} config
 * @param {string} config.url url under which market items can be found
 * @param {number} config.refreshIntervalMs interval in which cache will be refreshed
 * @param {axios} httpClient client used to make http request
 * @param {function} intervalLoop setIntervalFunction
 *
 * @return {MarketCache}
 */
function create(logger, {url, refreshIntervalMs}, httpClient = axios, intervalLoop= setInterval) {
    const items = new Map();

    intervalLoop(refreshItems, refreshIntervalMs);

    function refreshItems() {
        logger.info('starting refresh of items');
        return httpClient.get(url)
            .then( ({data})=> {
                data.items.forEach( item => items.set(item.id, item));
                logger.info('items refreshed');
            })
            .catch( err => {
                logger.error('Could not refresh items, will set store to zero ', err);
                // set items to zero elements?
            });
    }

    async function get(id) {
        // if first run map can be empty
        // that is why we need to fetch it
        if ( items.size == 0 ) {
            return refreshItems()
                .then( () => items.get(id));
        }

        return Promise.resolve(items.get(id));
    }

    return {
        get,
    };
}

module.exports.create = create;
