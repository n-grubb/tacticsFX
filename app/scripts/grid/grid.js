
'use strict';

angular.module('Grid', [])
.service('GridService', function() {
	
  this.grid   = [];
  this.tiles  = [];

  // this.grid = [
                //   [0,1,2,3,4,5,6,7,8,9], // row 1
                //   [0,1,2,3,4,5,6,7,8,9], // row 2
                //   [0,1,2,3,4,5,6,7,8,9], // row 3
                //   [0,1,2,3,4,5,6,7,8,9], // row 4
                //   [0,1,2,3,4,5,6,7,8,9], // row 5
                //   [0,1,2,3,4,5,6,7,8,9], // row 6
                //   [0,1,2,3,4,5,6,7,8,9], // row 7
                //   [0,1,2,3,4,5,6,7,8,9], // row 8
                //   [0,1,2,3,4,5,6,7,8,9], // row 9
                //   [0,1,2,3,4,5,6,7,8,9]  // row 10
                // ];

  // Size of the board
  this.size   = 4;

  // ...

});