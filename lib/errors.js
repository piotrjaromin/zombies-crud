'use strict';

class NotFoundError {
    constructor(msg) {
        this.msg = msg;
    }
}

class InternalError {
    constructor(msg) {
        this.msg = msg;
    }
}


class BadRequest {
    constructor(msg, details) {
        this.msg = msg;
        this.details = details;
    }
}

class ConflictError {
    constructor(msg, details) {
        this.msg = msg;
        this.details = details;
    }
}

class InvalidContentType {
    constructor(msg) {
        this.msg = msg;
    }
}

module.exports.NotFoundError = NotFoundError;
module.exports.InternalError = InternalError;
module.exports.InvalidContentType = InvalidContentType;
module.exports.BadRequest = BadRequest;
module.exports.ConflictError = ConflictError;
