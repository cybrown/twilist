'use strict';

var Q = require('q');

var Repository = require('./repository');

var JsonRepository = function () {
    Repository.call(this);
    this.data = {};
};
JsonRepository.prototype = Object.create(Repository.prototype);

JsonRepository.prototype._queryFindById = function (id) {
    var defer = Q.defer();
    defer.resolve(this.entities[id]);
    return defer.promise;
};

JsonRepository.prototype._queryFindAll = function () {
    var defer = Q.defer();
    var _this = this;
    defer.resolve(Object.keys(this.entities).map(function (key) {
        return _this.entities[key];
    }));
    return defer.promise;
};

JsonRepository.prototype._querySave = function (data) {
    var defer = Q.defer();
    this.entities[data._id] = data;
    defer.resolve();
    return defer.promise;
};

module.exports = JsonRepository;
