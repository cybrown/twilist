'use strict';

var BaseDriver = function () {

};

BaseDriver.prototype.open = function () {
    throw new Error('Must be implemented');
};

BaseDriver.prototype.close = function () {
    throw new Error('Must be implemented');
};

BaseDriver.prototype.flush = function () {
    throw new Error('Must be implemented');
};

BaseDriver.prototype.findAll = function () {
    throw new Error('Must be implemented');
};

BaseDriver.prototype.findBy = function (key, value) {
    throw new Error('Must be implemented');
};

BaseDriver.prototype.findOneBy = function (key, value) {
    throw new Error('Must be implemented');
};

BaseDriver.prototype.save = function (data) {
    throw new Error('Must be implemented');
};

module.exports = BaseDriver;
