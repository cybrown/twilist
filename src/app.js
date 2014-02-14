var fs = require('fs');
var path = require('path');

var Q = require('q');
var express = require('express');
var twitter = require('twitter');

var app = express();

app.use('/', express.static(path.join(__dirname, '..', 'public')));
app.use(express.bodyParser());

var twit = new twitter(require('../twitter-tokens.json'));

var cacheDir = path.join(__dirname, '..', 'data');

var cache = function (type, id) {
    if (id !== undefined) {
        return path.join(cacheDir, type + '-' + id) + '.json';
    } else {
        return path.join(cacheDir, type) + '.json';
    }
};

var getFriendsList = function (cursor) {
    var defer = Q.defer();
    cursor = cursor || -1;
    twit.get('/friends/list.json', {cursor: cursor}, function (data) {
        console.log(data);
        if (data.next_cursor) {
            getFriendsList(data.next_cursor).then(function (users) {
                defer.resolve(data.users.concat(users));
            });
        } else {
            defer.resolve(data.users);
        }
    });
    return defer.promise;
};

var getListsList = function () {
    var defer = Q.defer();
    twit.get('/lists/ownerships.json', function (data) {
        defer.resolve(data);
    });
    return defer.promise;
};

var getListMembers = function (id, cursor) {
    var defer = Q.defer();
    cursor = cursor || -1;
    twit.get('/lists/members.json', {list_id: id, cursor: cursor}, function (data) {
        console.log(id);
        console.log(data.next_cursor);
        if (data.next_cursor) {
            getListMembers(id, data.next_cursor).then(function (users) {
                defer.resolve(data.users.concat(users));
            });
        } else {
            defer.resolve(data.users);
        }
    });
    return defer.promise;
};

var doCache = function (func, type, id) {
    var defer = Q.defer();
    fs.exists(cache(type, id), function (exists) {
        if (exists) {
            fs.readFile(cache(type, id), function (err, data) {
                defer.resolve(JSON.parse(data));
            });
        } else {
            func().then(function (data) {
                fs.writeFile(cache(type, id), JSON.stringify(data), function (err, res) {
                    defer.resolve(data);
                });
            });
        }
    });
    return defer.promise;
};

var getFriendsListCache = function () {
    return doCache(getFriendsList, 'friends');
};

var getListsListCache = function () {
    return doCache(getListsList, 'lists');
};

var getListMembersCache = function (id) {
    return doCache(function () { return getListMembers(id); }, 'members', id);
};

var addUserToList = function (userId, listId) {
    var defer = Q.defer();
    twit.post('/lists/members/create.json', {list_id: listId, user_id: userId}, function () {
        console.log(arguments);
        defer.resolve(null);
    });
    return defer.promise;
};

app.get('/lists', function (req, res) {
    getListsListCache().then(function (data) {
        res.json(data);
    });
});

app.get('/friends', function (req, res) {
    getFriendsListCache().then(function (data) {
        res.json(data);
    });
});

app.get('/members/:id', function (req, res) {
    getListMembersCache(req.params.id).then(function (data) {
        res.json(data);
    });
});

app.post('/members/:listId/add', function (req, res) {
    addUserToList(req.body.userId, req.params.listId).then(function () {
        res.send('');
    });
});

app.listen(3000, function () {
    console.log('App listening...');
});
