'use strict';

const { InternalError } = require('../errors');

function create(logger, {url, validRates}, httpClient) {

    function calculateItemsPrices(items) {
        return httpClient.get(url)
            .then( ({data}) => data[0].rates)
            .then( rates => rates.filter( r => validRates.includes(r.code)) )
            .then( rates => items.map( item => appendRatesToItem(item, rates)))
            .catch(err => {
                logger.error('Could not calculate rates reason', err)
                return Promise.reject(new InternalError('Could not calculate prices for items'));
            })
    }

    function appendRatesToItem(item, rates) {
        item.priceRate = {};
        rates.forEach( rate => {
            item.priceRate[rate.code] = rate.ask * item.price;
        });
    }

    return {
        calculateItemsPrices
    }

}


module.exports.create = create;