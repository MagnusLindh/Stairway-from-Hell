import Player from "./player.js";
import Demon from "./demon.js";
import Angel from "./angel.js";
import Dragon from "./dragon.js";

/**
 * A class that extends Phaser.Scene and wraps up the core logic for the platformer level.
 */
export default class PlatformerScene extends Phaser.Scene {

  constructor () {
    super({key: 'PlatformerScene'});
  }

  preload() {
    // save game window dimensions
    this.gameWidth = this.sys.game.canvas.width;
    this.gameHeight = this.sys.game.canvas.height;

    this.load.spritesheet(
      "player",
      "../assets/spritesheets/0x72-industrial-player-32px-extruded.png",
      {
        frameWidth: 32,
        frameHeight: 32,
        margin: 1,
        spacing: 2,
      }
    );
    this.load.spritesheet(
      "demon",
      "../assets/spritesheets/Demon2.png",
      {
        frameWidth: 16,
        frameHeight: 16,
        margin: 0,
        spacing: 0,
      }
    );
    this.load.spritesheet(
      "angel",
      "../assets/spritesheets/Angel.png",
      {
        frameWidth: 16,
        frameHeight: 16,
        margin: 0,
        spacing: 0,
      }
    );
    this.load.spritesheet(
      "dragon",
      "../assets/spritesheets/Dragon.png",
      {
        frameWidth: 16,
        frameHeight: 16,
        margin: 0,
        spacing: 0,
      }
    );
    this.load.image("flare","../assets/spritesheets/Flare.png");
    this.load.image("trident","../assets/spritesheets/Trident.png");
    this.load.image("spike", "../assets/images/0x72-industrial-spike.png");
    this.load.image("crystal","../assets/images/Crystal.png");
    this.load.image("tiles", "../assets/tilesets/0x72-industrial-tileset-32px-extruded.png");
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/platformer-simple.json");
    //this.load.audio('music', '../assets/sounds/music.m4a');
    this.load.audio('hurt', '../assets/sounds/hurt.mp3');
    this.load.audio('gun', '../assets/sounds/laser.mp3');
    this.load.audio('crystal', '../assets/sounds/crystal.mp3');
    this.load.audio('whoosh', '../assets/sounds/whoosh.mp3');
  }

  create() {
    this.isPlayerDead = false;

    const map = this.make.tilemap({ key: "map" });
    const tiles = map.addTilesetImage("0x72-industrial-tileset-32px-extruded", "tiles");

    map.createLayer("Background", tiles).setPipeline('Light2D');
    this.groundLayer = map.createLayer("Ground", tiles).setPipeline('Light2D');
    map.createLayer("Foreground", tiles).setPipeline('Light2D');

    // lights
    this.lights.enable();
    this.lights.setAmbientColor(0x808080);
    this.light = this.lights.addLight(0, 0, 200);

    // emitter
    this.emitter = this.add.particles(400, 250, 'flare', {
      tint: 0xff0000,
      lifespan: 1000,
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      gravityY: 100,
      blendMode: 'ADD',
      emitting: false
    });

    // music
    //this.music = this.sound.add('music');
    //this.music.play();

    // sound effects
    this.hurt = this.sound.add('hurt');
    this.gun = this.sound.add('gun');
    this.crystal = this.sound.add('crystal');
    this.whoosh = this.sound.add('whoosh');

    // score
    this.score = 0;
    this.scoreNeeded;

    // mouse
    this.mouse=0;

    // add trident
    this.trident = this.add.sprite(100, 100, 'trident').setScale(2);

    // place player
    const spawnPoint = map.findObject("Objects", (obj) => obj.name === "Spawn Point");
    this.player = new Player(this, spawnPoint.x, spawnPoint.y);

    // place demon
    const demonPoint = map.findObject("Objects", (obj) => obj.name === "Demon");
    this.demon = new Demon(this, demonPoint.x, demonPoint.y);

    // place angel
    const angelPoint = map.findObject("Objects", (obj) => obj.name === "Angel");
    this.angel = new Angel(this, angelPoint.x, angelPoint.y);
  
    // place dragon
    const dragonPoint = map.findObject("Objects", (obj) => obj.name === "Dragon");
    this.dragon = new Dragon(this, dragonPoint.x, dragonPoint.y);

    // Collide the player against the ground layer - here we are grabbing the sprite property from
    // the player (since the Player class is not a Phaser.Sprite).
    this.groundLayer.setCollisionByProperty({ collides: true });
    this.physics.world.addCollider(this.player.sprite, this.groundLayer); //player
    this.physics.world.addCollider(this.demon.sprite, this.groundLayer); //demon
    this.physics.world.addCollider(this.angel.sprite, this.groundLayer); //angel
    this.physics.world.addCollider(this.dragon.sprite, this.groundLayer); //dragon

    // camera follows player
    this.cameras.main.startFollow(this.player.sprite);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // bullet
    this.lastFired = 0;

    class Bullet extends Phaser.GameObjects.Sprite
    {
        constructor (scene)
        {
            super(scene, 0, 0, 'flare');
            this.speed = Phaser.Math.GetSpeed(100, 1);
            scene.physics.world.enable(this);
            scene.add.existing(this);
            this.body.allowGravity = false;
        }

        fire (x, y, vx, vy)
        {
            this.setPosition(x, y);
            this.setActive(true);
            this.setVisible(true);
            this.body.enable = true;
            this.body.setVelocity(vx,vy);
        }

        update (time, delta)
        {
            if (this.x < -50 || this.x > 1280+50)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }
    }

    this.bullets = this.add.group({
        classType: Bullet,
        maxSize: 10,
        runChildUpdate: true
    });

    this.physics.world.addCollider(this.bullets, this.groundLayer, this.removeBullet, null, this);

    // Help text that has a "fixed" position on the screen
    this.message = this.add
      .text(10, 10, "Controls: Arrow keys or mouse.", {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 10, y: 10 },
        backgroundColor: "#999999",
      })
      .setScrollFactor(0);

    // The map contains a row of spikes. The spike only take a small sliver of the tile graphic, so
    // if we let arcade physics treat the spikes as colliding, the player will collide while the
    // sprite is hovering over the spikes. We'll remove the spike tiles and turn them into sprites
    // so that we give them a more fitting hitbox.
    this.spikeGroup = this.physics.add.staticGroup();
    this.groundLayer.forEachTile((tile) => {
      if (tile.index === 77) {
        this.scoreNeeded++;
        const spike = this.spikeGroup.create(tile.getCenterX(), tile.getCenterY(), "spike");

        // The map has spikes rotated in Tiled (z key), so parse out that angle to the correct body
        // placement
        spike.rotation = tile.rotation;
        if (spike.angle === 0) spike.body.setSize(32, 6).setOffset(0, 26);
        else if (spike.angle === -90) spike.body.setSize(6, 32).setOffset(26, 0);
        else if (spike.angle === 90) spike.body.setSize(6, 32).setOffset(0, 0);

        this.groundLayer.removeTileAt(tile.x, tile.y);
      }
    });

    // crystal
    this.crystalGroup = this.physics.add.staticGroup();
    this.groundLayer.forEachTile((tile) => {
      if (tile.index === 330) {
        const crystal = this.crystalGroup.create(tile.getCenterX(), tile.getCenterY(), "crystal");
        this.groundLayer.removeTileAt(tile.x, tile.y);
      }
    });

    this.physics.add.overlap(this.player.sprite, this.crystalGroup, this.removeCrystal, null, this);

    // mouse control
    this.input.on('pointerdown', function (pointer) {
      // set player direction
      if (pointer.x>this.gameWidth/2){
          this.mouse=1;
      } else {
          this.mouse=-1;
      }
    }, this);

    // mouse up
    this.input.on('pointerup', function (pointer) {
        this.mouse=0;
    }, this);
  }

  update(time, delta) {
    if (this.isPlayerDead) return;

    // Allow the sprites to respond to key presses and move itself
    this.player.update();
    if (this.angel.sprite.active){
      this.angel.update();
    }
    if (this.demon.sprite.active){
      this.demon.update();
    }
    if (this.dragon.sprite.active){
      this.dragon.update();
    }

    // light follow player
    this.light.x = this.player.sprite.x;
    this.light.y = this.player.sprite.y;

    //trident on off
    if (this.trident.visible){
      if (this.player.sprite.flipX){
        this.trident.setPosition(this.player.sprite.x-32,this.player.sprite.y);
        this.trident.setFlipX(true);
      } else {
        this.trident.setPosition(this.player.sprite.x+32,this.player.sprite.y);
        this.trident.setFlipX(false);        
      }
    }

    // trident demon hit
    this.monsterHit(this.demon);

    // trident angel hit
    this.monsterHit(this.angel);

    // trident dragon hit
    this.monsterHit(this.dragon);

    //player death
    if (this.player.sprite.y > this.groundLayer.height ||
    this.physics.world.overlap(this.player.sprite, this.spikeGroup) || 
    this.physics.world.overlap(this.player.sprite, this.bullets)){
      // Flag that the player is dead so that we can stop update from running in the future
      this.isPlayerDead = true;

      const cam = this.cameras.main;
      cam.shake(100, 0.05);
      cam.fade(250, 0, 0, 0);

      cam.once("camerafadeoutcomplete", () => {
        //this.music.stop();
        this.player.destroy();
        //this.scene.restart();
        this.scene.start('StartScene');
      });
    }
  }

  monsterHit (monster)
  {
    // trident monster hit
    if (this.trident.visible && monster.sprite.active && this.checkOverlap(this.trident, monster.sprite)){
      this.emitter.setPosition(monster.sprite.x,monster.sprite.y);
      this.emitter.explode(16);
      this.hurt.play();
      monster.destroy();
    }
  }

  checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
  }

  removeBullet(bullet){
    //  Hide the sprite
    this.bullets.killAndHide(bullet);

    //  And disable the body
    bullet.body.enable = false;
  }
  
  removeCrystal (sprite, crystal)
  {
    this.crystal.play();

    //  Hide the sprite
    this.crystalGroup.killAndHide(crystal);

    //  And disable the body
    crystal.body.enable = false;

    //  Add 1 to score
    this.score++;
    this.message.text = this.score;

    // check score
    if (this.score==this.scoreNeeded){
      this.scene.start('EndScene');
    }
  }  
}
