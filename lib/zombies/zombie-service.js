'use strict';

const Promise = require('bluebird');
const rn = require('random-number');

const {NotFoundError, ConflictError} = require('../errors');

// Max amount of items that can be stored on zombie
const MAX_ITEM_COUNT = 5;

/**
 * @typedef {Object} ZombieService
 * @property {function} get gets single zombie
 * @property {function} create creates single zombie and adds id to it
 * @property {function} update updates single zombie
 * @property {function} delete deletes single zombie
 * @property {function} getAll gets all zombies
 * @property {function} addItem adds items to zombie
 * @property {function} deleteItem deletes items from zombie
 * @property {function} getItems gets all items on zombie
 */

/**
 * Stores zombies in memory, promises are used because it should in db and those have async api,
 * but for this task those are overkill
 *
 * @param {Object} logger
 * @param {ItemService} itemsService
 * @param {MarketCache} marketCache
 *
 * @return {ZombieService}
 */
function create(logger, itemsService, marketCache) {
    logger.debug('created zombies service');

    const cemetery = new Map();

    async function getWithoutPrices(id) {
        if ( ! cemetery.has(id) ) {
            return Promise.reject(new NotFoundError(`Zombie with id ${id} does not exist`));
        }

        return Promise.resolve(cemetery.get(id));
    };

    // searches for zombie in map
    // when found updates items with new prices
    async function get(id) {
        return getWithoutPrices(id)
            .then( zombie => {
                return itemsService.calculateItemsPrices(zombie.items)
                    .then( itemPrices => {
                        zombie.items = itemPrices.items;
                        zombie.priceSum = itemPrices.priceSum;
                        return zombie;
                    });
            });
    }

    // generates id for zombie and stores it in map
    async function create(data) {
        data.id = generateId();
        cemetery.set(data.id, data);
        return Promise.resolve(data);
    }


    // updates zombie with given id
    // if zombie does not exist returns error
    async function update(id, updateData) {
        return getWithoutPrices(id)
            .then( zombie => {
                const updated = Object.assign({}, zombie, updateData);
                cemetery.set(id, updated);
            });
    };

    // deletes zombie with given id
    async function del(id) {
        // do we want error when zombie does not exists?
        return Promise.resolve(cemetery.delete(id));
    }

    // returns all items and calculates new item prices
    async function getAll() {
        const zombies = Array.from(cemetery.values());

        return Promise.map(zombies, zombie => {
            return itemsService.calculateItemsPrices(zombie.items)
                .then( itemPrices => {
                    zombie.items = itemPrices.items;
                    zombie.priceSum = itemPrices.priceSum;
                    return zombie;
                });
        });
    }


    // Adds item with itemId to zombie with given zombieId
    // will return not found if one of them does not exists or
    // if max amount of items for zombie has been reached
    async function addItem(zombieId, itemId) {
        return Promise.all([getWithoutPrices(zombieId), marketCache.get(itemId)])
            .then(([zombie, item]) => {
                if ( zombie.items.length >= MAX_ITEM_COUNT ) {
                    return Promise.reject(new ConflictError('Max amount of items reached'));
                }

                if ( !item ) {
                    return Promise.reject(new NotFoundError(`Item with id does not exist ${itemId}`));
                }

                return zombie.items.push(item);
            });
    }

    // deletes items items which is stored on zombie
    // when item does not exists nothing happens
    async function deleteItem(zombieId, itemId) {
        return getWithoutPrices(zombieId)
            .then( zombie => {
                zombie.items = zombie.items.filter( item => item.id != itemId);
                return update(zombieId, zombie);
            });
    };


    // returns items that are on given zombie
    async function getItems(zombieId) {
        return get(zombieId)
            .then( zombie => zombie.items);
    }

    // generates random id for new zombies
    function generateId() {
        return `${rn({
            min: 10000,
            max: 99999,
            integer: true,
        })}`;
    }


    return {
        get,
        create,
        update,
        delete: del,
        getAll,
        addItem,
        deleteItem,
        getItems,
    };
}

module.exports.create = create;
