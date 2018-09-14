'use strict';


function create(logger, itemsService) {
    logger.info('creating items handlers');

    function get(req, res, next) {
        const zombieId = req.params['id'];
        logger.debug('Getting items for zombie ', zombieId);

        return itemsService
            .getItems(zombieId)
            .then(items => res.status(200).send(items))
            .catch(next);
    }

    function post(req, res, next) {
        const zombieId = req.params['id'];
        const itemId = req.params['itemId'];
        logger.debug(`Adding item ${itemId} for zombie ${zombieId}`);

        return itemsService
            .addItem(zombieId, itemId)
            .then( () => res.status(201).json(zombie))
            .catch(next);
    }

    function deleteSingle(req, res, next) {
        const zombieId = req.params['id'];
        const itemId = req.params['itemId'];
        logger.debug(`Deleting item ${itemId} for zombie ${zombieId}`);

        return itemsService
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
