'use strict';

const Promise = require('bluebird');
const rn = require('random-number');

const { NotFoundError, BadRequest } = require('../errors');

const MAX_ITEM_COUNT = 5;

// Storing zombies in memory
// Promises are used because it should be db and those have async api, but they are overkill
function create(logger, itemsService, marketCache) {
    logger.debug('created zombies service');

    const cemetery = new Map();

    // searches for zombie in map
    // when found updates items with new prices
    function get(id) {
        if ( ! cemetery.has(id) ) {
            return Promise.reject(new NotFoundError(`Zombie with id ${id} does not exist`));
        }

        const zombie = cemetery.get(id);
        zombie.items = itemsService.calculateItemsPrices(zombie.items);
        return Promise.resolve(zombie);
    }

    // generates id for zombie and stores it in map
    function create(data) {
        data.id = generateId();
        return Promise.resolve(cemetery.set(data.id, data));
    }


    // updates zombie with given id
    // if zombie does not exist returns error
    function update(id, data) {
        if ( ! cemetery.has(id) ) {
            return Promise.reject(new NotFoundError(`Zombie with id ${id} does not exist`));
        }

        return Promise.resolve(cemetery.set(id, data));
    }

    // deletes zombie with given id
    function del(id) {
        // do we want error when zombie does not exists?
        return Promise.resolve(cemetery.delete(id));
    }

    // returns all items and calculates new item prices
    function getAll() {
        const zombies = Array.from(cemetery.values())
            .map(zombie => {
                zombie.items = itemsService.calculateItemsPrices(zombie.items)
                return zombie;
            });

        return Promise.resolve(zombies);
    }


    // Adds item with itemId to zombie with given zombieId
    // will return not found if one of them does not exists or
    // if max amount of items for zombie has been reached
    function addItem(zombieId, itemId) {
        return Promise.all(get(zombieId), marketCache.get(itemId))
            .then(([zombie, item]) => {
                if ( zombie.items.length >= MAX_ITEM_COUNT ) {
                    return Promise.reject(new BadRequest('Max amount of items reached'))
                }

                if ( !item ) {
                    return Promise.reject(new NotFoundError(`Item with id does not exist ${itemId}`))
                }

                zombie.items.push(item);
                return update(zombieId, zombie);
            });
    }

    // deletes items items which is stored on zombie
    // when item does not exists nothing happens
    function deleteItem(zombieId, itemId) {
        return get(zombieId)
            .then( zombie => {
                zombie.items = zombie.items.filter( item => item.id != itemId);
                return update(zombieId, zombie);
            });
    };


    // returns items that are on given zombie
    function getItems(zombieId) {
        return get(zombieId)
            .then( zombie => itemsService.calculateItemsPrices(zombie.items));
    }

    // generates random id for new zombies
    function generateId() {
        return `${rn({
            min: 10000,
            max: 99999,
            integer: true
        })}`
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
    }
}

module.exports.create = create;