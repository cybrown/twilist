var twilist = angular.module('twilist', []);

var MainCtrl = function ($scope, $http) {
	this.$http = $http;
	this.$scope = $scope;

	$scope.friends = {};
	$scope.lists = {};
};

MainCtrl.prototype.getLists = function () {
	var _this = this;
	this.$http.get('/lists').then(function (data) {
		data.data.lists.forEach(function (list) {
			_this.$scope.lists[list.id] = list;
			list.members = [];
		});
	});
};

MainCtrl.prototype.getFriends = function () {
	var _this = this;
	this.$http.get('/friends').then(function (data) {
		data.data.forEach(function (friend) {
			_this.$scope.friends[friend.id] = friend;
		});
	});
};

MainCtrl.prototype.getMembers = function (id) {
	var _this = this;
	return this.$http.get('/members/' + id).then(function (data) {
		return data.data.users;
	});
};

MainCtrl.prototype.assoc = function () {
	var _this = this;
	Object.keys(this.$scope.lists).forEach(function (listId) {
		var list = _this.$scope.lists[listId];
		list.members.length = 0;
		_this.getMembers(list.id).then(function (members) {
			members.forEach(function (member) {
				list.members.push(_this.$scope.friends[member.id]);
			});
		});
	});
};

MainCtrl.prototype.listHasMember = function (list, member) {
	return list.members.indexOf(member) !== -1;
};

twilist.controller('MainCtrl', MainCtrl);
