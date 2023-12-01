/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tileset by 0x72 under CC-0, https://0x72.itch.io/16x16-industrial-tileset
 */

import StartScene from "./start-scene.js";
import PlatformerScene from "./platformer-scene.js";
import EndScene from "./end-scene.js";

const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 800,
  parent: "game-container",
  pixelArt: false,
  backgroundColor: "#1d212d",
  scene: [StartScene, PlatformerScene, EndScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
    },
  },
};

const game = new Phaser.Game(config);
