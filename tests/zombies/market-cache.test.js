'use strict';

const should = require('should');
const logger = require('simple-node-logger').createSimpleLogger();

const cacheFac = require('../../lib/zombies/market-cache');

const config = {
    url: 'test.com',
    refreshIntervalMs: 2000,
};

const {sword, trident} = require('../fixtures/fixtures');

describe('Market cache should', () => {
    const items = [
        sword,
    ];

    const httpClient = {
        get: (url) => {
            url.should.equal(config.url);
            return Promise.resolve({data: {items}});
        },
    };

    let refreshCacheCb;
    const setInterval = (cb, timeout) => {
        timeout.should.equal(config.refreshIntervalMs);
        refreshCacheCb = cb;
    };

    const cache = cacheFac.create(logger, config, httpClient, setInterval);

    it('should call market service', async () => {
        should(await cache.get(`${sword.id}`)).deepEqual(sword);
        should(await cache.get(`${trident.id}`)).undefined();
    });


    it('should update market after setInterval callback is called', async () => {
        items.push(trident);
        refreshCacheCb();
        should(await cache.get(`${sword.id}`)).deepEqual(sword);
        should(await cache.get(`${trident.id}`)).deepEqual(trident);
    });
});
