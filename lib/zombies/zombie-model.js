'use strict';

/**
 * Zombie class is used as data container for new zombies
 * it also contains basic validation for zombies
 */
class Zombie {
    /**
     *
     * @param {Object} params
     * @param {Object} params.name name which will be used by zombie
     */
    constructor(params) {
        this.name = params.name;
        this.createdAt = new Date();
        this.items = [];
    }


    hasErrors() {
        return validate(this);
    }
}

/**
 * UpdateZombie class is used as data container for update of zombie
 * it also contains basic validation for zombies
 */
class UpdateZombie {
    /**
     *
     * @param {Object} params
     * @param {Object} params.name name which will be used by zombie
     */
    constructor(params) {
        this.name = params.name;
    }

    hasErrors() {
        return validate(this);
    }
}

/**
 * If zombie contains invalid fields this will return array with list of errors
 * otherwise false value is returned
 * @param {Object} zombie zombie which should be validated
 * @param {string} zombie.name name of zombie
 * @return {Array<Object>|false}
 */
function validate(zombie) {
    const errors = [];

    if ( !zombie.name || zombie.name.length == 0 ) {
        errors.push({field: 'name', message: 'name cannot be empty'});
    }

    return errors.length > 0 ? errors : false;
}

module.exports.Zombie = Zombie;
module.exports.UpdateZombie = UpdateZombie;
