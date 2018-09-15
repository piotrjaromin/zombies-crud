'use strict';

const should = require('should');
const logger = require('simple-node-logger').createSimpleLogger();

const itemsSvcFac = require('../../lib/zombies/items-service');
const {sword, trident, PLN, EUR, USD} = require('../fixtures/fixtures');

describe('items service should', () => {
    const config = {
        url: 'test.com',
        validRates: ['PLN', 'USD'],
    };

    const ratesData = [
        {
            rates: [PLN, EUR, USD],
        },
    ];

    const httpClient = {
        get: (url) => {
            url.should.equal(config.url);
            return Promise.resolve({data: ratesData});
        },
    };

    it('should calculate item price for rates in config', async () => {
        const svc = itemsSvcFac.create(logger, config, httpClient);
        const itemPrices = await svc.calculateItemsPrices([sword, trident]);

        const items = itemPrices.items;

        const priceSum = itemPrices.priceSum;

        priceSum.PLN.should.equal(600);
        priceSum.base.should.equal(300);
        priceSum.USD.should.equal(1229.9999999999998);

        // assert sword prices are correct
        should.exist(items[0].priceRates);
        items[0].priceRates.should.have.keys('USD', 'PLN');

        items[0].priceRates['USD'].should.equal(sword.price * USD.ask);
        items[0].priceRates['PLN'].should.equal(sword.price * PLN.ask);

        // assert trident prices are correct
        should.exist(items[1].priceRates);
        items[1].priceRates.should.have.keys('USD', 'PLN');
        items[1].priceRates['USD'].should.equal(trident.price * USD.ask);
        items[1].priceRates['PLN'].should.equal(trident.price * PLN.ask);
    });
});
