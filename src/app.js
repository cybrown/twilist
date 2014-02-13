var path = require('path');

var Q = require('q');
var express = require('express');
var twitter = require('twitter');

var app = express();

app.use('/', express.static(path.join(__dirname, '..', 'public')));

var twit = new twitter({
    consumer_key: 'BU1EZhqBoPS6raFt9WCHw',
    consumer_secret: '9648Fnaxr6BiVc7btamcRayMn9cVnmFgqunujar2Tc',
    access_token_key: '233189798-eA35qHp0gCwAgUfbEtyT2HTcY2nRjPmtyP6TYZZv',
    access_token_secret: 'XXfTE9GGpYZ0Wt35VzlbelDZvSmvibVpJUoYLQmEclRbL'
});

var getFriendsList = function () {
    var defer = Q.defer();
    twit.get('/friends/list.json', function (data) {
        defer.resolve(data);
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

var getListMembers = function (id) {
    var defer = Q.defer();
    twit.get('/lists/members.json', {list_id: id}, function (data) {
        defer.resolve(data);
    });
    return defer.promise;
};

app.get('/lists', function (req, res) {
    getListsList().then(function (data) {
        res.json(data);
    });
});

app.get('/friends', function (req, res) {
    getFriendsList().then(function (data) {
        res.json(data);
    });
});

app.get('/members/:id', function (req, res) {
    getListMembers(req.params.id).then(function (data) {
        res.json(data);
    });
});

app.listen(3000, function () {
    console.log('App listening...');
});
