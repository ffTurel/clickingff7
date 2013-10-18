'use strict';

var app = angular.module('clickingff7', []);

app.factory('Game', function() {
  return new Game();
});

function HomeCtrl($scope, $http, $timeout, Game) {

  // STEP 1
  // Load game from COOKIE

  var game = {};

  var battles = 0,
    xp = 0,
    gils = 0;

  var zone_level = 1;

  var zone = {}, enemies = {}, characters = {};

  // STEP 2
  // Extend COOKIE with background information

  // GAME
  Game.init($scope, game);

  // ZONE
  $http.get('data/zone.json').success(function(data) {
    $scope.zone = zone = data[zone_level];
  });

  // ENNEMIES
  $http.get('data/enemies.json').success(function(data) {
    var enemy, _data = [];
    for (var i in data[zone_level]) {
      enemy = new Enemy(Game, data[zone_level][i]);
      if (enemies[i]) {
        enemy.extends(enemies[i]);
      } else {
        enemy.init();
      }
      _data.push(enemy);
    }
    $scope.enemies = enemies = _data;
    Game.refreshEnemy();
  });

  // CHARACTERS
  $http.get('data/characters.json').success(function(data) {
    var character, _data = [];
    for (var i in data[zone_level]) {
      character = new Character(Game, data[zone_level][i]);
      if (characters[i]) {
        character.extends(characters[i]);
      } else {
        character.init();
      }
      _data.push(character);
    }
    $scope.characters = characters = _data;
    Game.refreshCharacters();
  });

  $scope.battles = battles;
  $scope.xp = xp;
  $scope.gils = gils;

  Game.run($timeout);

  /**
   * Explore to find enemies
   */
  $scope.explore = function() {
    $scope.battles += 1;
  };

  /**
   * Fight enemies to get experience
   */
  $scope.fight = function() {
    if ($scope.battles == 0) return;
    $scope.battles -= 1;
    $scope.xp += Game.enemy.xp;
    $scope.gils += Game.enemy.gils;
  };

  /**
   * Use experience to level up characters
   * @param  {object} id Character in the zone
   */
  $scope.level_up = function(character) {
    if (character.can_level_up()) {
      $scope.xp -= character.level_cost;
      character.level += 1;
      character.level_cost *= 2;
      Game.refreshCharacters();
    }
  };

  /**
   * Use experience to level up characters
   * @param  {object} id Character in the zone
   */
  $scope.weapon_up = function(character) {
    if (character.can_weapon_up()) {
      $scope.gils -= character.level_cost;
      character.weapon_level += 1;
      character.weapon_cost *= 2;
      Game.refreshCharacters();
    }
  };

  /**
   * Use ??? to search enemy
   * @param  {object} id Enemy in the zone
   */
  $scope.fight_enemy = function(enemy) {
    if (enemy.can_be_fought()) {
      $scope.battles -= enemy.get_cost();
      enemy.number += 1;
      Game.refreshEnemy();
    }
  };

  /**
   * Loose exp & gils to escape
   * @param  {object} id Enemy in the zone
   */
  $scope.escape = function(enemy) {
    if (enemy.can_be_escaped()) {
      enemy.number -= 1;
      Game.refreshEnemy();
    }
  };

};