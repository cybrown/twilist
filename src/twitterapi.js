var EventEmitter = require('events').EventEmitter;

var Q = require('q');

var TwitterAPI = function (twit) {
    EventEmitter.call(this);
    this.twit = twit;
};
TwitterAPI.prototype = Object.create(EventEmitter.prototype);


TwitterAPI.prototype.getFriendsList = function (cursor) {
    var defer = Q.defer();
    var _this = this;
    cursor = cursor || -1;
    this.twit.get('/friends/list.json', {cursor: cursor}, function (data) {
        if (data.statusCode) {
            defer.reject(createApiError(data.statusCode));
        } else if (data.next_cursor) {
            _this.getFriendsList(data.next_cursor).then(function (users) {
                users.forEach(function (user) {
                    _this.emit('user', user);
                });
                defer.resolve();
            }, function (err) {
                defer.reject(err);
            });
        } else {
            defer.resolve();
        }
    });
    return defer.promise;
};

var createApiError = function (code) {
    var err = new Error('Twitter API error');
    err.statusCode = code;
    return err;
};

TwitterAPI.prototype.getListsOwnerships = function () {
    var defer = Q.defer();
    var _this = this;
    this.twit.get('/lists/ownerships.json', function (data) {
        if (data.statusCode) {
            console.log(data);
            defer.reject(createApiError(data.statusCode));
        } else {
            data.lists.forEach(function (list) {
                _this.emit('list', list);
            });
            defer.resolve();
        }
    });
    return defer.promise;
};

TwitterAPI.prototype.getListsMembers = function (id, cursor) {
    var defer = Q.defer();
    var _this = this;
    cursor = cursor || -1;
    this.twit.get('/lists/members.json', {list_id: id, cursor: cursor}, function (data) {
        if (data.statusCode) {
            defer.reject(createApiError(data.statusCode));
        } else if (data.next_cursor) {
            _this.getListsMembers(id, data.next_cursor).then(function (users) {
                defer.resolve();
            }, function (err) {
                defer.reject(err);
            });
        } else {
            defer.resolve();
        }
    });
    return defer.promise;
};

TwitterAPI.prototype.postListsMembersCreate = function (userId, listId) {
    var defer = Q.defer();
    var _this = this;
    this.twit.post('/lists/members/create.json', {list_id: listId, user_id: userId}, function () {
        console.log(arguments);
        defer.resolve();
    });
    return defer.promise;
};

module.exports = TwitterAPI;
