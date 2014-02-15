'use strict';
var Q = require('q');

var Repository = function () {
    this.cache = {};
};

//<editor-fold desc="Protected Abstract">
Repository.prototype._queryFindById = function (id) {
    throw new Error('Method not defined');
};

Repository.prototype._queryFindAll = function () {
    throw new Error('Method not defined');
};

Repository.prototype._querySave = function (data) {
    throw new Error('Method not defined');
};

Repository.prototype._createNewEntity = function () {
    throw new Error('Method not defined');
};

Repository.prototype._doDeserialize = function (entity, data, idField) {
    throw new Error('Method not defined');
};

Repository.prototype._doSerialize = function (entity, idField) {
    throw new Error('Method not defined');
};
//</editor-fold>

//<editor-fold desc="Private">
Repository.prototype.__findFromCache = function (id) {
    return this.cache[id];
};

Repository.prototype.__saveInCache = function (entity) {
    this.cache[entity._id] = entity;
};

Repository.prototype.__collectionToEntities = function (collection) {
    var _this = this;
    return collection.map(function (data) {
        var entity = _this.__findFromCache(data._id);
        if (!entity) {
            entity = _this._createNewEntity();
            _this.deserialize(entity, data);
            _this.__saveInCache(entity);
        }
        return entity;
    });
};
//</editor-fold>

/**
 * Deserialize a plain object into an entity
 * @param entity
 * @param data
 * @param [idField]
 */
Repository.prototype.deserialize = function (entity, data, idField) {
    return this._doDeserialize(entity, data, idField || '_id');
};

/**
 * Serialize an entity into a plain object
 * @param entity
 * @param [idField]
 * @returns {{}}
 */
Repository.prototype.serialize = function (entity, idField) {
    return this._doSerialize(entity, idField || '_id');
};

/**
 * Find an entity by id
 * @param id
 * @returns {promise|*|Q.promise}
 */
Repository.prototype.findById = function (id) {
    var defer = Q.defer();
    var _this = this;
    this.__findFromCache(id).then(function (entity) {
        if (!entity) {
            entity = _this._createNewEntity();
            _this.deserialize(entity, _this._queryFindById(id));
            _this.__saveInCache(entity);
        }
        defer.resolve(entity);
    });
    return defer.promise;
};

/**
 * Find all entities
 * @returns {promise|*|Q.promise}
 */
Repository.prototype.findAll = function () {
    var defer = Q.defer();
    var _this = this;
    this._queryFindAll().then(function (dataList) {
        defer.resolve(_this.__collectionToEntities(dataList));
    });
    return defer.promise;
};

/**
 * Save an already saved entity
 * @param entity
 * @returns {*}
 */
Repository.prototype.save = function (entity) {
    return this._querySave(this.serialize(entity));
};

module.exports = Repository;
