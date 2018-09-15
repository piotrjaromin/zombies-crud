'use strict';

const axios = require('axios');
const Promise = require('bluebird');


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
            // do not call external service if there is no reason
            return Promise.resolve({items, priceSum: calculateSum(items)});
        };

        return httpClient.get(url, {
            headers: {
                Accept: 'application/json',
            },
        })
            .then( ({data}) => data[0].rates)
            .then( rates => rates.filter( r => validRates.includes(r.code)) )
            .then( rates => items.map( item => appendRatesToItem(item, rates)))
            .catch(err => {
                logger.error('Could not calculate rates, reason', err);
                // well it seems that nbp can return 404 from time to time
                // so to not block this functionality lets just return items without prices
                // return Promise.reject(new InternalError('Could not calculate prices for items'));
                return items;
            })
            .then( () => ({items, priceSum: calculateSum(items)}));
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

    function calculateSum(items) {
        // base is price before conversion to any currency
        const init = validRates.reduce( (prevVal, rate) => {
            prevVal[rate] = 0;
            return prevVal;
        }, {base: 0});

        return items.reduce( (prevVal, item) => {
            // if NPB returned error this will not be available
            if ( item.priceRates ) {
                validRates.forEach( rate => prevVal[rate] += item.priceRates[rate]);
            }

            prevVal.base += item.price;
            return prevVal;
        }, init);
    }

    return {
        calculateItemsPrices,
    };
}


module.exports.create = create;
