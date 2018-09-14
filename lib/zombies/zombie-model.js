'use strict';

class Zombie {

    constructor(params) {
        this.name = params.name;
        this.createdAt = new Date();
        this.items = [];
    }

    hasErrors() {
        const errors = [];

        if ( !this.name || this.name.length == 0 ) {
            errors.push({field: "name", message: 'name cannot be empty'});
        }

        return errors.length > 0 ? errors : false
    }
}

module.exports.Zombie = Zombie;
