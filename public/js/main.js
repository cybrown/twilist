var twilist = angular.module('twilist', []);

var MainCtrl = function ($scope, $http) {
	this.$http = $http;
	this.$scope = $scope;

	$scope.lists = {};
	$scope.message = 'ok';
};

MainCtrl.prototype.getLists = function () {
	var _this = this;
	this.$http.get('/lists').then(function (data) {
		_this.$scope.lists.length = 0;
		data.data.lists.forEach(function (list) {
			_this.$scope.lists[list.id] = list;
		});
	});
};

MainCtrl.prototype.getFriends = function () {
	var _this = this;
	this.$http.get('/friends').then(function (data) {
		_this.$scope.friends = data.data.users;
	});
};

MainCtrl.prototype.getMembers = function (id) {
	var _this = this;
	this.$http.get('/members/' + id).then(function (data) {
		console.log(data.data.users);
		//_this.$scope.memberships = data.data.users;
	});
};

twilist.controller('MainCtrl', MainCtrl);
