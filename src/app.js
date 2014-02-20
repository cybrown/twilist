'use strict';

var fs = require('fs');
var path = require('path');

var Plugme = require('plugme').Plugme;
var Q = require('q');
var express = require('express');
var twitter = require('twitter');
var MongoClient = require('mongodb').MongoClient;

var TwitterAPI = require('./twitterapi');

var plug = new Plugme();

plug.set('twit', new twitter(require('../twitter-tokens.json')));

plug.set('mongodb', function (done) {
    MongoClient.connect('mongodb://localhost:27017/twilist', function (err, db) {
        if (err) {
            throw err;
        }
        done(db);
    });
});

plug.set('twitapi', ['twit'], function (twit) {
    return new TwitterAPI(twit);
});

plug.set('listdb', ['mongodb'], function (mongodb) {
    return mongodb.collection('lists');
});

plug.set('userdb', ['mongodb'], function (mongodb) {
    return mongodb.collection('users');
});

plug.set('twitFetch', ['twitapi', 'listdb', 'userdb'], function (twitapi, listdb, userdb) {
    twitapi.on('list', function (list) {
        var _id = list.id_str;
        list.user = list.user.id_str;
        list.created_at = new Date(list.created_at);
        delete list.id;
        delete list.id_str;

        listdb.update({_id: _id}, {$set: list}, {w: 1, upsert: true}, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
    twitapi.on('user', function (user) {
        console.log('user ok');
        var _id = user.id_str;
        user.created_at = new Date(user.created_at);
        delete user.id;
        delete user.id_str;

        userdb.update({_id: _id}, {$set: user}, {w: 1, upsert: true}, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
    return null;
});

plug.set('server', [
    'twitapi',
    'twitFetch'
], function (
    twitapi,
    twitFetch
) {
    var server = express();
    server.use('/', express.static(path.join(__dirname, '..', 'public')));
    server.use(express.bodyParser());

    server.get('/fetch', function (req, res) {
        Q.all([/*twitapi.fetchLists(), */twitapi.fetchFriends()]).then(function () {
            res.send('ok');
        }).catch(function (err) {
            res.send(500, err);
        });
    });

    /*
     server.get('/lists', function (req, res) {
        listrepo.findAll().then(function (lists) {
            res.json(lists);
        });
    });

     server.get('/friends', function (req, res) {
        getFriendsListCache().then(function (data) {
            res.json(data);
        });
    });

     server.get('/members/:id', function (req, res) {
        getListsMembersCache(req.params.id).then(function (data) {
            res.json(data);
        });
    });

     server.post('/members/:listId/add', function (req, res) {
        twitapi.postListsMembersCreate(req.body.userId, req.params.listId).then(function () {
            res.send('');
        });
    });
    */

    return server;
});

plug.set('start', ['server'], function (server) {
    server.listen(3000, function () {
        console.log('Server listening...');
    });
});

plug.onError(function (err) {
    console.log(err);
});

plug.start(function (done) {
    done();
});
