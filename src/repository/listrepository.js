'use strict';
var Q = require('q');
var Repository = require('./repository');

var List = require('../entity/list');

var ListRepository = function () {
    Repository.call(this);
    this.entities = {};
};
ListRepository.prototype = Object.create(Repository.prototype);

//<editor-fold desc="Protected">
ListRepository.prototype._queryFindById = function (id) {
    var defer = Q.defer();
    defer.resolve(this.entities[id]);
    return defer.promise;
};

ListRepository.prototype._queryFindAll = function () {
    var defer = Q.defer();
    var _this = this;
    defer.resolve(Object.keys(this.entities).map(function (key) {return _this.entities[key];}));
    return defer.promise;
};

ListRepository.prototype._querySave = function (data) {
    var defer = Q.defer();
    this.entities[data._id] = data;
    defer.resolve();
    return defer.promise;
};

ListRepository.prototype._createNewEntity = function () {
    return new List();
};

ListRepository.prototype._doDeserialize = function (entity, data, idField) {
    entity._id = data[idField];
    entity.name = data.name;
    return entity;
};

ListRepository.prototype._doSerialize = function (entity, idField) {
    var data = {};
    data[idField] = entity._id;
    data.name = entity.name;
    return data;
};
//</editor-fold>
