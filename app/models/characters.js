/**
 * Characters class
 * @param {object} Game
 */

function Characters(Game) {

  this.Game = Game;

  this.characters = [];

  this.hpMax = 0;
  this.hits = 0;
  this.limitMax = 0;
  this.gils = 0;
};

/**
 *
 * Add a character to the party
 * @param {Object} data [description]
 * @return {Character}
 */
Characters.prototype.add = function(data) {
  var character = new Character(this, data);
  this.characters.push(character);
  return character;
};

/**
 * Get the in-team characters
 * @return {Array}
 */
Characters.prototype.getTeam = function() {
  return _.where(this.characters, {
    inTeam: true
  })
};

/**
 * Build elements linked to characters
 */
Characters.prototype.build = function() {
  for (var i in this.Game.data.characters) {
    var data = this.Game.data.characters[i];

    // Character
    var character = this.add(data);

    // Weapon
    var ref = character.weapon;
    var data = this.Game.data.weapons[ref];
    character.weapon = new Weapon(character, data);

    // Materia
    var ref = character.materia;
    var data = this.Game.data.materias[ref];
    character.materia = new Materia(character, data);

  }
};

/**
 * Refresh all the party
 */
Characters.prototype.refresh = function() {
  var characters = this.getTeam();
  for (var i in characters) {
    // HP
    this.hpMax += characters[i].getHpMax();
    this.hits += characters[i].getHits();
  }

  this.limitMax = this.hpMax / 2;

  if (!_.has(this, 'hp')) {
    this.hp = this.hpMax;
  }
  if (!_.has(this, 'limit')) {
    this.limit = 0;
  }
};

/**
 * Returns in pixels characters hp bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Characters.prototype.hpProgress = function(pixels_max) {
  return this.hp / this.hpMax * pixels_max;
};

/**
 * Characters auto-attack process
 */
Characters.prototype.run = function() {
  var self = this;
  var $timeout = this.Game.$timeout;

  this.timer = $timeout(function() {
    // Stop attacking if fight's over
    if (!self.Game.fight) return;

    var hits = self.hits;
    self.Game.enemies.get_attacked(hits);

    self.run();
  }, 1000);
};

/**
 * Enemies are under attack
 * @param  {int} hits
 */
Characters.prototype.get_attacked = function(hits) {
  this.hp -= hits;
  if (this.hp <= 0) {
    this.hp = 0;

    this.Game.end_fight(false);
  }
};

/**
 * Do a manual cure - based on materia
 * @return {[type]} [description]
 */
Characters.prototype.manualCure = function() {
  var hpMax = this.hpMax;
  var characters = this.getTeam();

  var Lvl = 0;
  for (var i in characters) {
    var character = characters[i];
    if (character.materia.ref == 'restore') {
      Lvl += character.materia.level;
    }
  }

  var res = Math.ceil(hpMax * (Lvl * 2 / 100));
  return res;
};

/**
 * Returns if it is possible to attack
 * @return {boolean}
 */
Characters.prototype.canAttack = function() {
  return this.Game.fight;
};

/**
 * Returns if it is possible to execute a limit (powerful attack)
 * @return {boolean}
 */
Characters.prototype.canLimit = function() {
  return (this.Game.fight && this.limit == this.limitMax);
};

/**
 * Returns if it is possible to cure characters hp
 * @return {boolean}
 */
Characters.prototype.canCure = function() {
  return (this.hp < this.hpMax);
};

/**
 * Returns if it is possible to escape from enemy
 * @return {boolean}
 */
Characters.prototype.canEscape = function() {
  return this.Game.fight;
};

/**
 * Returns data for export
 * @return {Object}
 */
Characters.prototype.save = function() {
  var res = {};

  for (var i in this.characters) {
    var character = this.characters[i];
    res[character.ref] = character.save();
  }

  return res;
};