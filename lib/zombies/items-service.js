'use strict';

const axios = require('axios');
const Promise = require('bluebird');

const {InternalError} = require('../errors');


/**
 * @typedef {Object} ItemService
 * @property {function} calculateItemsPrices given items as input will calculate price for each
 * currency provided in config.validRates
 */

/**
 * Creates service responsible for recalculating items prices for given rates
 * @param {Object} logger
 * @param {Object} config
 * @param {string} config.url url under which current currency rates can be found
 * @param {Array<string>} config.validRates rates for which prices should be calculated
 * @param {axios} httpClient client which is used to make http requests
 * @return {ItemService}
 */
function create(logger, {url, validRates}, httpClient = axios) {
    async function calculateItemsPrices(items) {

        if (items.length == 0) {
            return Promise.resolve([]);
        };

        return httpClient.get(url)
            .then( ({data}) => data[0].rates)
            .then( rates => rates.filter( r => validRates.includes(r.code)) )
            .then( rates => items.map( item => appendRatesToItem(item, rates)))
            .catch(err => {
                logger.error('Could not calculate rates, reason', err);
                return Promise.reject(new InternalError('Could not calculate prices for items'));
            });
    }

    function appendRatesToItem(item, rates) {
        item.priceRates = {};
        rates.forEach( rate => {
            // this will not be correct because of floating point math error
            // should be replaced with library which handles monetary math
            item.priceRates[rate.code] = rate.ask * item.price;
        });
        return item;
    }

    return {
        calculateItemsPrices,
    };
}


module.exports.create = create;
