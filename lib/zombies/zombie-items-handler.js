'use strict';

/**
 * Handles item operations on zombies
 * Allows for adding/deleting and getting items which zombie posses
 * @param {Object} logger
 * @param {ZombieService} zombiesService service for controlling zombies
 *
 * @return {Object}
 */
function create(logger, zombiesService) {
    logger.info('creating items handlers');

    function get(req, res, next) {
        const zombieId = req.params['id'];
        logger.debug('Getting items for zombie ', zombieId);

        return zombiesService
            .getItems(zombieId)
            .then(items => res.status(200).send(items))
            .catch(next);
    }

    function post(req, res, next) {
        const zombieId = req.params['id'];
        const itemId = req.params['itemId'];
        logger.debug(`Adding item ${itemId} for zombie ${zombieId}`);

        return zombiesService
            .addItem(zombieId, itemId)
            .then( () => res.status(201).json(zombie))
            .catch(next);
    }

    function deleteSingle(req, res, next) {
        const zombieId = req.params['id'];
        const itemId = req.params['itemId'];
        logger.debug(`Deleting item ${itemId} for zombie ${zombieId}`);

        return zombiesService
            .deleteItem(zombieId, itemId)
            .then(() => res.status(204).end())
            .catch(next);
    }

    return {
        get,
        post,
        deleteSingle,
    };
}

module.exports.create = create;
