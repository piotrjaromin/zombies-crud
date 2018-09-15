'use strict';

const HttpStatus = require('http-status-codes');

const errors = require('./errors');

const errorMiddleware = (logger) => {
    return (err, req, res, next) => {
        if (err instanceof errors.NotFoundError) {
            return res.status(HttpStatus.NOT_FOUND).json(err);
        }

        if (err instanceof errors.InvalidContentType) {
            return res.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).json(err);
        }

        if (err instanceof errors.BadRequest) {
            return res.status(HttpStatus.BAD_REQUEST).json(err);
        }

        if (err instanceof errors.ConflictError) {
            return res.status(HttpStatus.CONFLICT).json(err);
        }

        logger.error('Unknown error occurred. ', err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(new errors.InternalError('Internal Error occurred'));
    };
};

function jsonContentMiddleware(req, res, next) {
    if (req.headers['content-type'] !== 'application/json') {
        next(new errors.InvalidContentType('Supported content type is application/json'));
    }

    return next();
}

module.exports.errorMiddleware = errorMiddleware;
module.exports.jsonContentMiddleware = jsonContentMiddleware;
