'use strict';

var Q = require('q');

var ListMysqlRepository = function (my) {
    this.my = my;
};

ListMysqlRepository.QUERY_SELECT_ALL = 'SELECT `id`, `name`, `id_user` FROM `lists`';
ListMysqlRepository.QUERY_SELECT_BY_ID = 'SELECT `id`, `name`, `id_user` FROM `lists` WHERE `id` = ?';
ListMysqlRepository.QUERY_UPDATE_BY_ID = 'UPDATE `lists` SET `name` = ?, `id_user` = ? WHERE `id` = ?';
ListMysqlRepository.QUERY_INSERT_WITH_ID = 'INSERT INTO `lists` (`name`, `id_user`, `id`) VALUES (?, ?, ?)';

ListMysqlRepository.prototype.save = function (list) {
    var _this = this;
    return Q.promise(function (resolve, reject) {
        _this.my.query(ListMysqlRepository.QUERY_SELECT_BY_ID, [list.id], function (err, lists) {
            if (err) {
                reject(err);
                return;
            }
            var query;
            if (lists.length) {
                query = ListMysqlRepository.QUERY_UPDATE_BY_ID;
            } else {
                query = ListMysqlRepository.QUERY_INSERT_WITH_ID;
            }
            _this.my.query(query, [list.name, list.user.id_str, list.id_str], function (err, result) {
                if (err) reject(err);
                else resolve(result);
            });
        });
    });
};

ListMysqlRepository.prototype.findAll = function () {
    var _this = this;
    return Q.promise(function (resolve, reject) {
        _this.my.query(ListMysqlRepository.QUERY_SELECT_ALL, function (err, result) {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

module.exports = ListMysqlRepository;
