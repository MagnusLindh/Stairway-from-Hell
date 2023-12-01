/**
* A dragon class
 */
export default class Dragon {
    constructor(scene, x, y) {
      this.scene = scene;
  
      // Create the animations we need from the player spritesheet
      const anims = scene.anims;
      anims.create({
        key: "dragon-idle",
        frames: anims.generateFrameNumbers("dragon", { start: 0, end: 1 }),
        frameRate: 3,
        repeat: -1,
      });
  
      // Create the physics-based sprite that we will move around and animate
      this.sprite = scene.physics.add
        .sprite(x, y, "dragon", 0)
        .setDrag(1000, 0)
        .setMaxVelocity(300, 300)
        .setScale(2)
        .setFlipX(true);
  
      this.sprite.anims.play("dragon-idle", true);

      // bullet time
      this.time = 0;
      this.lastFired = 0;
    }
  
    update() {
      const accelerationY = 1100;
      const minDist = 200;
      const dist = Phaser.Math.Distance.BetweenPoints(this.sprite, this.scene.player.sprite);
      if (dist < minDist && this.sprite.y>this.scene.player.sprite.y){
        this.sprite.setAccelerationY(-accelerationY);
      } else {
        this.sprite.setAccelerationY(0);
      }

      //bullet
      this.time++;
      if (dist < minDist && this.sprite.active && this.time > this.lastFired){
        this.scene.gun.play();
        const bullet = this.scene.bullets.get();
        const vx = (this.scene.player.sprite.x - this.sprite.x)/dist*100;
        const vy = (this.scene.player.sprite.y - this.sprite.y)/dist*100;
        if (bullet)
        {
            bullet.fire(this.sprite.x, this.sprite.y, vx, vy);
            this.lastFired = this.time + 50;
        }
      }
    }
  
    destroy() {
      this.sprite.destroy();
    }
  }
  