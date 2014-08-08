'use strict';

/**
 * @ngdoc overview
 * @name tacticsfxApp
 * @description
 * # tacticsfxApp
 *
 * Main module of the application.
 */

angular
  .module('tacticsfxApp', ['Game', 'Grid', 'ngAnimate','ngRoute'])

  // ROUTING ===============================================================================================================
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/play', {
        templateUrl: 'views/play.html',
        controller: 'GameCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })

  // CONTROLLERS ===========================================================================================================
  .controller('GameCtrl', function($scope) 
  {
    $scope.pageClass = 'play-window';

    // Create a grid for our gameboard.
    $scope.grid = [
      [0,1,2,3,4,5,6,7], // row 1
      [0,1,2,3,4,5,6,7], // row 2
      [0,1,2,3,4,5,6,7], // row 3
      [0,1,2,3,4,5,6,7], // row 4
      [0,1,2,3,4,5,6,7], // row 5
      [0,1,2,3,4,5,6,7], // row 6
      [0,1,2,3,4,5,6,7], // row 7
      [0,1,2,3,4,5,6,7], // row 8
    ];

    // Create a "selected" grid to hold the tiles where the unit can possible move. 
    // Used in conjunction with ng-class:highlight
    resetSelected();

    // Define the initial turn. Since the watcher runs on load, this will be the 
    // opposite of whoever has the starting turn.
    $scope.turn = 'enemy'; 

    // Define array of units.
    $scope.units = [];

    // Define the number of units on each team.
    var numOfFriendlyUnits = 3; // to be user determined??
    var numOfEnemyUnits    = 3; // to be user determined??

    // Get Total: Useful for creating the unit ID's.
    // var totalUnits = numOfEnemyUnits + numOfFrienldyUnits;

    // =====================================  FUNCTION: CREATE UNIT  ==================
    function createUnit(team, positionX, positionY)
    {

      var unitX, unitY;
      console.log('Creating '+team+'...');

      // If positionX or y is set, use that. FOR NOW: only supports setting both x & y. 
      if (typeof positionX !== 'undefined' && typeof positionY !== 'undefined') {
        unitX = positionX;
        unitY = positionY;
      }
      // else, determine random starting point. 
      else {
        for (var r = 0; r < 100; r++) 
        {          
          var minimumRow, randModifier; 

          if (team === 'Enemy')
          {
            // highest row an enemy can spawn in. MAX - 3 (equal to: y_count - 2); 
            minimumRow   = $scope.grid.length - 3; 
            randModifier = $scope.grid.length - minimumRow; 
          }
          else {
            minimumRow   = 0;
            randModifier = 3; 
          }          

          unitY = Math.floor((Math.random() * randModifier) + minimumRow);
          unitX = Math.floor((Math.random() * 7) + 0);

          console.log(team+' Y: '+unitY+'; '+team+' X: '+unitX);

          // if nothing exists in this position, reroll.
          if (typeof $scope.grid[unitY][unitX] !== 'object')
          { 
            console.log(team+' Placed!');
            break;
          }
          
          console.log('Error!: Tile already occupied! Re-rolling...');
        }
      }

      // set up the rest of the unit values.
      var name, status, sprite;

      if (team === 'Enemy')
      {
        name   = 'Orc';
        status = 'inactive';
        sprite = 'orc.png';
      }
      else
      {
        name   = 'Knight';
        status = 'active';
        sprite = 'knight.png';
      }


      // Add to our units array.
      $scope.units.push( 
        { 

          'id'             : $scope.units.length,
          'name'           : name,
          'team'           : team.toLowerCase(),
          'health'         : 3,
          'sprite'         : sprite,
          'xposition'      : unitX,
          'yposition'      : unitY,
          'status'         : status,
          'xStartingPoint' : unitX,
          'yStartingPoint' : unitY,
          'hasMoved'       : false
           
        }
      );

      // Add it to the gameboard.
      $scope.grid[unitY][unitX] = $scope.units[$scope.units.length - 1];

    }
    // =====================================  END FUNCTION: CREATE UNIT  ============XX

    // CREATE ALL UNITs ---------------------------
    for(var z = 0; z < numOfEnemyUnits; z++ )
    {
      createUnit('Enemy');
    }

    for(var f = 0; f < numOfFriendlyUnits; f++ )
    {
      createUnit('Friendly');
    }
   


    // =====================================  WATCHER: TURN WATCHER  ================W
    $scope.$watch('turn', function(newTurn) {

      updateTurn(newTurn);

      if (newTurn === 'Enemy') {
        initiateAI();
      }

    }, true);
    // =====================================  END WATCHER: TURN WATCHER  ===========WXX



    // =====================================  WATCHER: UNITS ARRAY WATCHER  ==========W
    $scope.$watch('units', function(change) {

      for (var u = 0; u < change.length; u++)
      {
        var newVal = change[u];

        if (newVal) {

          // output the new data.
          console.log('=================================================');
          console.log('Unit ID: '+newVal.id);
          console.log('Unit Name: '+newVal.name);
          console.log('Status: '+newVal.status);
          console.log('Position: '+newVal.yposition+', '+newVal.xposition);
          console.log('Health: '+newVal.health);
          console.log('Starting Point: '+newVal.yStartingPoint+', '+newVal.xStartingPoint);

          resetSelected();

          var gameStatus = winOrLose();
          console.log('GAME STATUS: '+gameStatus);

          if (gameStatus !== false){
            break;
          }

          if (newVal.health < 1)
          {
            removeFromGrid(newVal.name);
            
            if ($scope.units[newVal.id].status !== 'defeated'){
              console.log($scope.units[newVal.id].name+' has fallen in battle!');
              $scope.units[newVal.id].status = 'defeated';
            }
            
          }
          // update the location
          // if not first move.
          else if (newVal.hasMoved ){

            removeFromGrid(newVal.name);
            $scope.grid[newVal.yposition][newVal.xposition] = $scope.units[newVal.id];
            console.log('Placed unit in ['+newVal.yposition+']['+newVal.xposition+']');

          }
          // if first move.
          else if ( newVal.xposition !== newVal.xStartingPoint || newVal.yposition !== newVal.yStartingPoint) 
          {

            removeFromGrid(newVal.name);

            console.log( $scope.units[newVal.id] );

            $scope.units[newVal.id].hasMoved = true;
            $scope.grid[newVal.yposition][newVal.xposition] = $scope.units[newVal.id];
            console.log('FIRST MOVE: Placed unit in ['+newVal.yposition+']['+newVal.xposition+']');
            
          }  

          gameStatus = winOrLose();
          if (gameStatus !== false){
            // display win or lose message.
            alert(gameStatus);
          }

        }

      }
    }, true);
    // =====================================  END WATCHER: UNITS ARRAY WATCHER  ====WXX

  
    // ===================================== FUNCTION: UPDATE TURN ====================
    function updateTurn(newTurn){

      var activeTeam = 'enemy';
      var inactiveTeam = 'friendly';

      console.log('The '+newTurn+' team finished their turn.');

      if (newTurn === 'enemy')
      {

        activeTeam   = 'enemy';
        inactiveTeam = 'friendly';

      }
      else if (newTurn === 'friendly')
      {

        activeTeam   = 'friendly';
        inactiveTeam = 'enemy';

      }

      console.log(inactiveTeam+' units will become the active team.'); 
      console.log(activeTeam+' units will rest.');

      // update status for all units
      for (var a = 0; a < $scope.units.length; a++) 
      {
        if ($scope.units[a].team && $scope.units[a].team === inactiveTeam && $scope.units[a].status !== 'defeated')
        {
          $scope.units[a].status = 'active';
        }
        else if ($scope.units[a].team && $scope.units[a].team === activeTeam && $scope.units[a].status !== 'defeated')
        {
          $scope.units[a].status = 'inactive';
        }
      }
      console.log('TURN CHANGE');
    }
    // =====================================  END FUNCTION: UPDATE TURN  ============XX


    // ===================================== FUNCTION: WIN OR LOSE? ===================
    function winOrLose() {

      var fDefeated = 0;
      var eDefeated = 0;

      for (var i = 0; i < $scope.units.length; i++) {
        if ($scope.units[i].status && $scope.units[i].status === 'defeated'){
          
          if ($scope.units[i].team && $scope.units[i].team === 'friendly')
          {
            fDefeated++;
          }
          else if ($scope.units[i].team && $scope.units[i].team === 'enemy')
          {
            eDefeated++;
          }

        }
      }

      console.log('Dead Enemies: '+eDefeated+'; Dead Friendlies: '+fDefeated);

      if (fDefeated > 2)
      { 
        return 'Defeat is not acceptable, solider!';
      }
      else if (eDefeated > 2)
      {
        return 'Victory Is Yours!';
      }
      else 
      {
        return false;
      } 

    }
    // =====================================  END FUNCTION: WIN OR LOSE?  ===========XX


    // =====================================  FUNCTION: RESET "SELECTED" ==============
    function resetSelected() {

      $scope.selected = [
                ['','','','','','','',''], // row 1
                ['','','','','','','',''], // row 2
                ['','','','','','','',''], // row 3
                ['','','','','','','',''], // row 4
                ['','','','','','','',''], // row 5
                ['','','','','','','',''], // row 6
                ['','','','','','','',''], // row 7
                ['','','','','','','',''], // row 8
              ];
    }
    // =====================================  END FUNCTION: RESET "SELECTED" ========XX


    // =====================================  FUNCTION: SEARCH GRID & REMOVE UNIT =====
    function removeFromGrid(name)
    {
      
      for (var i = 0; i < $scope.grid.length; i++) {
        for (var j = 0; j < $scope.grid[i].length; j++) {
          if ($scope.grid[i][j].name && $scope.grid[i][j].name === name){
            $scope.grid[i][j] = j;
            console.log('Removed unit from ['+i+','+j+']');
          }
        }
      }

    }
    // =================================  END FUNCTION: SEARCH GRID & REMOVE UNIT ===XX

    $scope.possibleMoves = function(id, x, y) {

      // add class to all of the remaining spots, if they are empty and they exist (ie not outside of the table.)
      // alert ( 'POSSIBLE MOVES: \n ['+(Number(x)+1)+']['+y+'] \n ['+(Number(x)+2)+']['+y+'] \n ['+(Number(x)-1)+']['+y+'] \n ['+(Number(x)-2)+']['+y+'] \n ['+x+']['+(Number(y)+1)+'] \n ['+x+']['+(Number(y)+2)+'] \n ['+x+']['+(Number(y)-1)+'] \n ['+x+']['+(Number(y)-2)+'] \n ['+(Number(x)+1)+']['+(Number(y)+1)+'] \n ['+(Number(x)+1)+']['+(Number(y)-1)+'] \n ['+(Number(x)-1)+']['+(Number(y)-1)+'] \n ['+(Number(x)-1)+']['+(Number(y)+1)+']');
      
      // check the spaces below the unit.
      ifExistsAddClass( id, x, (Number(y)+1) );
      ifExistsAddClass( id, x, (Number(y)+2) );

      // check the spaces above the unit.
      ifExistsAddClass( id, x, (Number(y)-1) );
      ifExistsAddClass( id, x, (Number(y)-2) );

      // check to the right of the unit.
      ifExistsAddClass( id, (Number(x)+1), y );
      ifExistsAddClass( id, (Number(x)+2), y );

      // check to the left of the unit.
      ifExistsAddClass( id, (Number(x)-1), y );
      ifExistsAddClass( id, (Number(x)-2), y );

      // check the diagonal spaces
      ifExistsAddClass( id, (Number(x)+1), (Number(y)+1) );
      ifExistsAddClass( id, (Number(x)+1), (Number(y)-1) );
      ifExistsAddClass( id, (Number(x)-1), (Number(y)-1) );
      ifExistsAddClass( id, (Number(x)-1), (Number(y)+1) );
    };

    function ifExistsAddClass(id, x, y)
    {

        // check if space is open for movement.
        if($scope.grid[y] !== undefined && $scope.grid[y][x] !== undefined )
        {
          if(typeof $scope.grid[x][y] !== 'object' && $scope.units[id].status === 'active')
          {
              // add a highighter class
              // console.log('WHATS IN THIS TILE? (['+x+']['+y+']): '+$scope.grid[x][y]);
              $scope.selected[y][x] = id.toString();
          }
            
        }
        else {
          // alert('['+y+']['+x+'] does not exist.');
        }
    }

    $scope.isSelected = function(x, y) {
      if ($scope.selected[y][x])
        { 
          return true;
        }
    };

    $scope.isTurn = function(id) {
      if ($scope.units[id].status === 'active')
      {
        return true;
      }
    };

    $scope.moveUnit = function(x, y) {

      var unitId = $scope.selected[y][x];

      if (unitId){
              
        var numId = Number( unitId );
        console.log('Unit to Move: '+$scope.units[numId].name);

        // update location on unit.
        $scope.units[numId].xposition = y;
        $scope.units[numId].yposition = x;

        // check if next to another unit.
        var enemies = enemyNearby(numId, x, y);
        if(enemies.length > 0)
        { 
          for (var e = 0; e < enemies.length; e++)
          {
            if (enemies[e])
            {
              var enemy = enemies[e];
              console.log(enemy);
              // var answer = confirm('ENEMY['+enemy.yposition+']['+enemy.xposition+'] : Do you want to attack this unit?');
              
                enemy.health -= 1;
                console.log('Attacked Enemy '+enemy.name+ ' for 2 damage.');
              
            }
          }
        }

        console.log('Made it here. Team Who Acted: '+$scope.turn);
        // update turn.
        if ($scope.turn === 'friendly')
        {
          console.log('updated scope.turn.');
          $scope.turn = 'enemy';
        } 
        else if ($scope.turn === 'enemy')
        {
          console.log('updated scope.turn.');
          $scope.turn = 'friendly';
        } 

        // tell me what this location is. 
        // console.log($scope.units[numID]);
      }
      else {
        return;
      }

    };

    function enemyNearby(selfID, x, y) {

      var enemies = [];

      // console.log(selfID); 
      // console.log($scope.grid[x][(y+1)].id); 

      // check to the right
      if ( typeof $scope.grid[x][(y+1)] === 'object' && $scope.grid[x][(y+1)].id !== selfID && $scope.grid[x][(y+1)].team !== $scope.units[selfID].team)
      {
        enemies[(enemies.length+1)] = $scope.grid[x][(y+1)];
        console.log('RIGHT ENEMY: '+$scope.grid[x][(y+1)].name);
      }

      // check to the left
      if ( typeof $scope.grid[x][(y-1)] === 'object' && $scope.grid[x][(y-1)].id !== selfID && $scope.grid[x][(y-1)].team !== $scope.units[selfID].team)
      {
        enemies[(enemies.length+1)] = $scope.grid[x][(y-1)];
        console.log('LEFT ENEMY: '+$scope.grid[x][(y-1)].name);
      }

      // check above
      if ( typeof $scope.grid[(x-1)][y] === 'object' && $scope.grid[(x-1)][y].id !== selfID && $scope.grid[(x-1)][y].team !== $scope.units[selfID].team)
      {
        enemies[(enemies.length+1)] = $scope.grid[(x-1)][y];
        console.log('TOP ENEMY: '+$scope.grid[(x-1)][y].name);
      }

      // check below
      if ( typeof $scope.grid[(x+1)][y] === 'object' && $scope.grid[(x+1)][y].id !== selfID && $scope.grid[(x+1)][y].team !== $scope.units[selfID].team)
      {
        enemies[(enemies.length+1)] = $scope.grid[(x+1)][y];
        console.log('BOTTOM ENEMY: '+$scope.grid[(x+1)][y].name);
      }

      return enemies;

    }

    function initiateAI() 
    {
      // detect enemies in range.
      var badguys = [1,3,5];
      var goodguys = unitsInRange(badguys);

      console.log('GOODGUYS IN RANGE:');
      console.log(goodguys);

      // 1. if one has <2 health, kill it. 
      // 2. if one has <3 health, attack it. 
      // 3. else, attack easiest unit in range. 
      // if none in range, move random unit up 2 spaces. 

    }

    // take array of ids, and find all enemy units within range.
    function unitsInRange(badguys)
    {

      var enemyUnits = [];

      // For each badguy, check if a goodguy is within attacking range. 
      for (var v = 0; v < badguys.length; v++)
      {

        var x = $scope.units[badguys[v]].xposition;
        var y = $scope.units[badguys[v]].yposition;
        console.log('CENTER OF SEARCH: '+$scope.units[badguys[v]].yposition+', '+$scope.units[badguys[v]].xposition);
        var selfID = badguys[v];
        var possibleLocations = [
                                                                                      { 'x' : x, 'y' : y+3 },
                                                             { 'x' : x-1, 'y' : y+2 },{ 'x' : x, 'y' : y+2 },{ 'x' : x+1, 'y' : y+2 },
                                    { 'x' : x-2, 'y' : y+1 },{ 'x' : x-1, 'y' : y+1 },{ 'x' : x, 'y' : y+1 },{ 'x' : x+1, 'y' : y+1 },{ 'x' : x+2, 'y' : y+1 }, 
          { 'x' : x-1, 'y' :  y  }, { 'x' : x-2, 'y' :  y  },{ 'x' : x-3, 'y' :  y  },                       { 'x' : x+1, 'y' :  y  },{ 'x' : x+2, 'y' :  y  }, { 'x' : x+3, 'y' : y },
                                    { 'x' : x-2, 'y' : y-1 },{ 'x' : x-1, 'y' : y-1 },{ 'x' : x, 'y' : y-1 },{ 'x' : x+1, 'y' : y-1 },{ 'x' : x+2, 'y' : y-1 },
                                                             { 'x' : x-1, 'y' : y-2 },{ 'x' : x, 'y' : y-2 },{ 'x' : x+1, 'y' : y-2 }, 
                                                                                      { 'x' : x, 'y' : y-3 },
        ];

        // loop through each location.
        for (var pl = 0; pl < possibleLocations.length; pl++)
        { 
          // Does it exist?
          if ( $scope.grid[possibleLocations[pl].y] !== undefined && $scope.grid[possibleLocations[pl].y][possibleLocations[pl].x] !== undefined  )
          {
            // Is there another unit (object) in this location?
            if( typeof $scope.grid[possibleLocations[pl].y][possibleLocations[pl].x] === 'object' && $scope.grid[possibleLocations[pl].y][possibleLocations[pl].x].id !== selfID && $scope.grid[possibleLocations[pl].y][possibleLocations[pl].x].team !== $scope.units[selfID].team)
            {
              console.log ('Searched: '+possibleLocations[pl].y+', '+possibleLocations[pl].x);
              enemyUnits[(enemyUnits.length)] = $scope.grid[possibleLocations[pl].y][possibleLocations[pl].x];
            }
          }
        }

      }
      return enemyUnits;
    }
  })
  // CONTROLLERS ========================================================================================================END
  



  // DIRECTIVES ============================================================================================================
  .directive('unit', function() {
      return {
          restrict: 'A',
          template: '<div class="unit" id="{{tile.id}}" status="{{tile.status}}" health="{{tile.health}}" attack="{{tile.attack}}" position="{{tile.xposition}}, {{tile.yposition}}"> <image src="images/{{tile.sprite}}"><image class="healthbar" src="images/health-{{tile.health}}.png"><span>{{ tile.name }}</span> </div>'
      };
  });
  // DIRECTIVES =========================================================================================================END
