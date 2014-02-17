'use strict';
var Q = require('q');
var JsonRepository = require('./jsonrepository');

var List = require('../entity/list');

var ListRepository = function () {
    JsonRepository.call(this);
    this.entities = {};
};
ListRepository.prototype = Object.create(JsonRepository.prototype);

//<editor-fold desc="Protected">
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

module.exports = ListRepository;
