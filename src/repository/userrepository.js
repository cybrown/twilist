'use strict';

var Q = require('q');

var JsonRepository = require('./jsonrepository');

var User = require('../entity/user');

var UserRepository = function () {
    JsonRepository.call(this);
};
UserRepository.prototype = Object.create(JsonRepository.prototype);

UserRepository.prototype._createNewEntity = function () {
    return new User();
};

UserRepository.prototype._doDeserialize = function (entity, data, idField) {
    entity._id = data[idField];
    entity.name = data.name;
    return entity;
};

UserRepository.prototype._doSerialize = function (entity, idField) {
    var data = {};
    data[idField] = entity._id;
    data.name = entity.name;
    return data;
};

module.exports = UserRepository;
