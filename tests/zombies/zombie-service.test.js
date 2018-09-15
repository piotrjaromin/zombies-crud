'use strict';

const Promise = require('bluebird');

const should = require('should');
const logger = require('simple-node-logger').createSimpleLogger();

const zombieSvcFac = require('../../lib/zombies/zombie-service');
const {NotFoundError, ConflictError} = require('../../lib/errors');
const {Zombie} = require('../../lib/zombies/zombie-model');

const {sword, trident} = require('../fixtures/fixtures');
const items = {
    [sword.id]: sword,
    [trident.id]: trident,
};

describe('zombie service should', () => {
    const zombie = new Zombie({name: 'John blood'});

    const itemsSvc = {
        calculateItemsPrices: (items) => {
            return Promise.resolve({items: items, priceSum: {}});
        },
    };
    const marketSvc = {
        get: (id) => Promise.resolve(items[id]),
    };

    const svc = zombieSvcFac.create(logger, itemsSvc, marketSvc);

    let createdZombie;
    it('allow to store zombie', async () => {
        createdZombie = await svc.create(zombie);
        should.exist(createdZombie);
        should.exist(createdZombie.id);
    });

    it('allow to get existing zombie', async () => {
        const gotZombie = await svc.get(zombie.id);
        should.exist(gotZombie);
        gotZombie.id.should.equal(zombie.id);
        gotZombie.items.should.deepEqual([]);
    });

    it('allow to get list of zombie', async () => {
        const zombies = await svc.getAll();

        should.exist(zombies);
        zombies.should.have.length(1);

        const gotZombie = zombies[0];
        should.exist(gotZombie);
        gotZombie.id.should.equal(zombie.id);
        gotZombie.items.should.deepEqual([]);
    });

    it('error when trying to get not existing zombie', async () => {
        try {
            await svc.get('some random id');
        } catch ( err ) {
            return err.should.be.instanceof(NotFoundError);
        }

        should.fail('should fail, and test should end in catch clause');
    });

    it('fail when updating not existing zombie', async () => {
        try {
            await svc.update('some random id', {});
        } catch ( err ) {
            return err.should.be.instanceof(NotFoundError);
        }

        should.fail('should fail, and test should end in catch clause');
    });

    it('allow to update name of zombie', async () => {
        const name = 'newName';
        await svc.update(createdZombie.id, {name});

        const gotZombie = await svc.get(zombie.id);

        should.exist(gotZombie);
        gotZombie.name.should.equal(name);
        gotZombie.items.should.deepEqual([]);
    });

    it('allow to add item to zombie', async () => {
        await svc.addItem(createdZombie.id, sword.id);

        const gotZombie = await svc.get(zombie.id);

        should.exist(gotZombie.items);
        gotZombie.items.should.have.length(1);
        gotZombie.items[0].should.deepEqual(sword);
    });

    it('get all items on zombie', async () => {
        const items = await svc.getItems(createdZombie.id);

        should.exist(items);
        items.should.have.length(1);
        items[0].should.deepEqual(sword);
    });

    it('fail when adding item to not existing zombie', async () => {
        try {
            await svc.addItem('some random id', sword.id);
        } catch ( err ) {
            return err.should.be.instanceof(NotFoundError);
        }

        should.fail('should fail, and test should end in catch clause');
    });

    it('fail when adding not existing item to zombie', async () => {
        try {
            await svc.addItem(createdZombie.id, 'some random id');
        } catch ( err ) {
            return err.should.be.instanceof(NotFoundError);
        }

        should.fail('should fail, and test should end in catch clause');
    });

    it('allow to removal of item from zombie', async () => {
        await svc.deleteItem(createdZombie.id, sword.id);

        const gotZombie = await svc.get(zombie.id);
        gotZombie.items.should.have.length(0);
    });

    it('fail when zombie will have more than 5 items', async () => {
        // zombie already has 0 item  on him so add 5
        // actually it could be loop based on MAX_ITEM_COUNT const
        await svc.addItem(createdZombie.id, sword.id);
        await svc.addItem(createdZombie.id, sword.id);
        await svc.addItem(createdZombie.id, sword.id);
        await svc.addItem(createdZombie.id, sword.id);
        await svc.addItem(createdZombie.id, sword.id);

        // now zombie has 5 item, next should throw error
        try {
            await svc.addItem(createdZombie.id, sword.id);
        } catch ( err ) {
            return err.should.be.instanceof(ConflictError);
        }

        should.fail('should fail, and test should end in catch clause');
    });
});

