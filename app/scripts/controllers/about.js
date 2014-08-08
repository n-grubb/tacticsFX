'use strict';

/**
 * @ngdoc function
 * @name tacticsfxApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the tacticsfxApp
 */
angular.module('tacticsfxApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.pageClass = 'about-window';

  });
