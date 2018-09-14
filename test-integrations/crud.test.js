'use strict';

const config = require('config');
const should = require('should');
const axios = require('axios');

const HttpStatus = require('http-status-codes');

const headers = {
    'Content-type': 'application/json',
};

describe('For crud on zombies should return', () => {

    let createdId;

    const validZombie = { name: "Johny Dead"};

    it('bad request for empty object', () => {
        return axios.post(config.zombiesUrl, {}, {headers})
            .then( () => should.fail('For missing request body test should return 400'))
            .catch( ({response: {status}}) => {
                status.should.equal(HttpStatus.BAD_REQUEST);
            });
    });

    it('return not found for not existing object', () => {
        return axios.get(`${config.zombiesUrl}/some_random_val`)
            .then( () => should.fail('For not existing owner test should return 404'))
            .catch( ({response: {status}}) => {
                status.should.equal(HttpStatus.NOT_FOUND);
            });
    });


    it('create new zombie', () => {
        return axios.post(config.zombiesUrl, validZombie, {headers})
            .then( ({data, status}) => {
                status.should.equal(HttpStatus.CREATED);
                Object.keys(data).should.containDeep(['name', 'createdAt', 'items', 'id'])
                createdId = data.id;
            });
    });


    it('get newly created zombie', () => {
        return axios.get(`${config.zombiesUrl}/${createdId}`)
            .then( ({data, status}) => {
                status.should.equal(HttpStatus.OK);
                data.should.be.Object();
                data.name.should.deepEqual(validZombie.name);
            });
    });

    it('list all zombies', () => {
        return axios.get(`${config.zombiesUrl}`)
            .then( ({data, status}) => {
                status.should.equal(HttpStatus.OK);
                data.should.be.Array();
                data.should.have.length(1);
            });
    });

    it('update existing zombie', () => {
        const url = `${config.zombiesUrl}/${createdId}`;
        const newName = 'Mistery Boney';

        const update = Object.assign({name: newName});

        return axios.put(url, update, {headers})
            .then( ({status}) => status.should.equal(HttpStatus.NO_CONTENT))
            .then( () => axios.get(url))
            .then( ({data, status}) => {
                status.should.equal(HttpStatus.OK);
                data.name.should.equal(update.name);
            })
            .catch(logTestError);
    });

    it('not found for update of not existing zombie', () => {

        return axios.put(`${config.zombiesUrl}/some_random_url`, validZombie, {headers})
            .then( () => should.fail('For not existing owner test should return 404'))
            .catch( ( {response: {status}} ) => {
                status.should.equal(HttpStatus.NOT_FOUND);
            })
            .catch(logTestError);
    });


    it('delete existing zombie', () => {
        return axios.delete(`${config.zombiesUrl}/${createdId}`)
            .then( ({status}) => {
                status.should.equal(HttpStatus.NO_CONTENT);
            });
    });

    it('do not list deleted zombies', () => {
        return axios.get(`${config.zombiesUrl}`)
            .then( ({data, status}) => {
                status.should.equal(HttpStatus.OK);
                data.should.be.Array();
                data.should.have.length(0);
            });
    });

    function logTestError(err) {
        if (err.response ) {
            console.log(`Request error, status ${err.response.status}, Body `, err.response.data);
        } else {
            console.log('Test error: ', err);
        }

        return Promise.reject(err);
    }
});