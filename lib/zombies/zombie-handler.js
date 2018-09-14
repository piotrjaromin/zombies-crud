'use strict';

const model = require('./zombie-model');
const errors = require('../errors');

function create(logger, zombiesDal) {
    logger.info('creating zombies handlers');

    function get(req, res, next) {
        logger.debug('Getting all zombies');

        return zombiesDal
            .getAll()
            .then(zombies => res.status(200).send(zombies))
            .catch(next);
    }

    function post(req, res, next) {
        logger.debug('Creating new zombie');
        const zombie = new model.Zombie(req.body);

        const validationErrors = zombie.hasErrors();
        if (validationErrors ) {
            return next(new errors.BadRequest('Invalid payload sent', validationErrors));
        }

        return zombiesDal
            .create(zombie)
            .then(() => res.status(201).json(zombie))
            .catch(next);
    }

    function getSingle(req, res, next) {
        logger.debug('getting single zombie');
        const id = req.params['id'];

        return zombiesDal
            .get(id)
            .then(zombie => res.status(200).json(zombie))
            .catch(next);
    }

    function deleteSingle(req, res, next) {
        const id = req.params['id'];
        logger.debug('deleting zombie ', id);
        return zombiesDal
            .delete(id)
            .then(() => res.status(204).end())
            .catch(next);
    }

    function putSingle(req, res, next) {
        logger.debug('Updating zombie');
        const zombie = new model.Zombie(req.body);
        const id = req.params[idParam];

        const validationErrors = zombie.hasErrors();
        if (validationErrors ) {
            return next(new errors.BadRequest('Invalid payload sent', validationErrors));
        }

        return zombiesDal
            .updateById(id, zombie)
            .then( () => res.status(204).end())
            .catch(next);
    }


    return {
        get,
        post,
        getSingle,
        deleteSingle,
        putSingle
    };
}

module.exports.create = create;
