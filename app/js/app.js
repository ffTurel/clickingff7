'use strict';

/**
 * App module
 * @type {object}
 */
var app = angular.module('clickingff7', ['ngCookies']);

/**
 * Game Service
 */
app.factory('Game', function() {
  return new Game();
});

/**
 * Used to get floor number
 */
app.filter('floor', function() {
  return function(input) {
    return Math.floor(input);
  }
});

/**
 * Used to round a number
 */
app.filter('round', function() {
  return function(input, decimals) {
    var d = Math.pow(10, decimals);
    return Math.round(input * d) / d;
  }
});

/**
 * Used to clean an associative array
 */
app.filter('clean', function() {
  return function(items) {
    var result = {};
    angular.forEach(items, function(value, key) {
      if (!value.hasOwnProperty('id')) {
        result[key] = value;
      }
    });
    return result;
  };
});

/**
 * MAIN CLASS
 * @param {[type]} $scope       [description]
 * @param {[type]} $http        [description]
 * @param {[type]} $timeout     [description]
 * @param {[type]} Game         [description]
 * @param {[type]} $cookieStore [description]
 */

function HomeCtrl($scope, $cookieStore, $http, $timeout, Game) {

  // STEP 1
  // Load saved game from COOKIE

  var save = $cookieStore.get('game');

  // STEP 2
  // Extend COOKIE with background information

  // GAME
  Game.init($scope, $cookieStore, $http, $timeout);

  Game.preload();

  // STEP 3
  // Scope actions

  /**
   * Explore to find enemies
   */
  $scope.explore = function() {
    $scope.total_enemy_pwr += 1;
    Game.scopes.total_enemy_pwr = $scope.total_enemy_pwr;
  };

  /**
   * Fight enemies to get experience
   */
  $scope.fight = function() {
    if ($scope.total_enemy_pwr < 1) return;
    $scope.total_enemy_pwr -= 1;
    Game.scopes.total_enemy_pwr = $scope.total_enemy_pwr;
    $scope.total_xp += 1;
    Game.scopes.total_xp = $scope.total_xp;
  };

  /**
   * Use experience to level up characters
   * @param  {object} id Character in the zone
   */
  $scope.level_up = function(character) {
    if (character.can_level_up()) {
      $scope.total_xp -= character.data.level_cost;
      Game.scopes.total_xp = $scope.total_xp;
      character.data.level += 1;
      character.data.level_cost *= 2;
      Game.refresh();
    }
  };

  /**
   * Use experience to level up characters
   * @param  {object} id Character in the zone
   */
  $scope.weapon_up = function(character) {
    if (character.can_weapon_up()) {
      $scope.total_gils -= character.data.weapon_cost;
      Game.scopes.total_gils = $scope.total_gils;
      character.data.weapon_level += 1;
      character.data.weapon_cost *= 2;
      Game.refresh();
    }
  };

  /**
   * Use ??? to search enemy
   * @param  {object} id Enemy in the zone
   */
  $scope.fight_enemy = function(enemy) {
    if (enemy.can_be_fought()) {
      $scope.total_enemy_pwr -= enemy.get_cost();
      Game.scopes.total_enemy_pwr = $scope.total_enemy_pwr;
      enemy.data.number += 1;
      if (enemy.data.boss) {
        $scope.boss_defeated = Game.scopes.boss_defeated = true;
      }
      Game.refresh();
    }
  };

  /**
   * Loose exp & gils to escape
   * @param  {object} id Enemy in the zone
   */
  $scope.escape = function(enemy) {
    if (enemy.can_be_escaped()) {
      enemy.data.number -= 1;
      Game.refresh();
    }
  };

  /**
   * Go next zone
   */
  $scope.next_zone = function() {
    if ($scope.boss_defeated) {
      if (Game.zone.level == 2) {
        alert("Congrates! You've cleaned the game!\nThere should be more to come.. Stay tuned!");
        return;
      }
      Game.next_zone();
    }
  };

  /**
   * Save the game
   */
  $scope.save = function() {
    Game.save();
  };

  /**
   * Reset the game
   */
  $scope.reset = function() {
    Game.reset();
  };

};