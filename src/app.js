'use strict';

var fs = require('fs');
var path = require('path');

var Plugme = require('plugme').Plugme;
var Q = require('q');
var express = require('express');
var twitter = require('twitter');
var TwitterAPI = require('./twitterapi');
var List = require('./entity/list');
var ListRepository = require('./repository/listrepository');

var plug = new Plugme();

plug.set('listrepo', function () {
    return new ListRepository();
});

plug.set('cacheDir', path.join(__dirname, '..', 'data'))

plug.set('twit', new twitter(require('../twitter-tokens.json')))

plug.set('twitapi', ['twit'], function (twit) {
    return new TwitterAPI(twit);
});

plug.set('cache', ['cacheDir'], function (cacheDir) {
    return function (type, id) {
        if (id !== undefined) {
            return path.join(cacheDir, type + '-' + id) + '.json';
        } else {
            return path.join(cacheDir, type) + '.json';
        }
    };
});

plug.set('doCache', ['cache'], function (cache) {
    return function (func, type, id) {
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
});

plug.set('getFriendsListCache', ['doCache', 'twitapi'], function (doCache, twitapi) {
    return function () {
        return doCache(function () { return twitapi.getFriendsList(); }, 'friends');
    };
});

plug.set('getListsOwnershipsCache', ['doCache', 'twitapi'], function (doCache, twitapi) {
    return function () {
        return doCache(function () { return twitapi.getListsOwnerships(); }, 'lists');
    };
});

plug.set('getListsMembersCache', ['doCache', 'twitapi'], function (doCache, twitapi) {
    return function () {
        return doCache(function () { return twitapi.getListsMembers(); }, 'members');
    };
});

plug.set('fetchLists', ['twitapi', 'listrepo'], function (twitapi, listrepo) {
    return function () {
        twitapi.on('list', function (data) {
            var list = new List();
            listrepo.deserialize(list, data, 'id_str');
            listrepo.save(list);
        });
        return twitapi.getListsOwnerships();
    };
});

plug.set('app', [
    'getListsOwnershipsCache',
    'getFriendsListCache',
    'getListsMembersCache',
    'fetchLists',
    'twitapi',
    'listrepo'
], function (
    getListsOwnershipsCache,
    getFriendsListCache,
    getListsMembersCache,
    fetchLists,
    twitapi,
    listrepo
) {
    var app = express();
    app.use('/', express.static(path.join(__dirname, '..', 'public')));
    app.use(express.bodyParser());

    app.get('/fetch', function (req, res) {
        fetchLists().then(function () {
            listrepo.findAll().then(function (lists) {
                res.json(lists);
            });
        }, function (err) {
            res.send(500);
        });
    });

    app.get('/lists', function (req, res) {
        listrepo.findAll().then(function (lists) {
            res.json(lists);
        });
    });

    app.get('/friends', function (req, res) {
        getFriendsListCache().then(function (data) {
            res.json(data);
        });
    });

    app.get('/members/:id', function (req, res) {
        getListsMembersCache(req.params.id).then(function (data) {
            res.json(data);
        });
    });

    app.post('/members/:listId/add', function (req, res) {
        twitapi.postListsMembersCreate(req.body.userId, req.params.listId).then(function () {
            res.send('');
        });
    });

    return app;
});

plug.set('start', ['app'], function (app) {
    app.listen(3000, function () {
        console.log('App listening...');
    });
});

plug.onError(function (err) {
    console.log(err);
});

plug.start(function () {});
