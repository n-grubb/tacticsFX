// Game Module

angular.module('Game', [])
.service('GameManager', function() {
  // Create a new game
  this.newGame = function() {};
  // Handle the move action
  this.move = function() {};
  // Update the score
  this.updateScore = function(newScore) {};
  // Are there moves left?
  this.movesAvailable = function() {
    return GridService.anyCellsAvailable() ||
           GridService.tileMatchesAvailable();
  };

});

// .service('GameManager', function() {

//   // Create a new game
//   this.newGame = function() {};

//   // Handle the move action
//   this.move = function() {};

//   // Update the score
//   this.updateScore = function(newScore) {};
  
//   // Are there any units left?
//   this.unitsLeft = function()  {
//     return GridService.enemiesLeft() || GridService.friendlysLeft();
//   };

// });