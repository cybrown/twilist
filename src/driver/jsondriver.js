'use strict';

var BaseDriver = require('./basedriver');

var JsonDriver = function () {
    BaseDriver.call(this);
};
JsonDriver.prototype = Object.create(BaseDriver.prototype);

module.exports = JsonDriver;
