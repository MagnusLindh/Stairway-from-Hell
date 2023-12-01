 export default class StartScene extends Phaser.Scene {
    constructor () {
        super({key: 'StartScene'});
    }   
    preload(){
        this.load.audio('intro', '../assets/sounds/intro.m4a');
        this.load.image("title","../assets/images/Titel.png");
    }
     create(){
        // title
        this.add.image(225, 200, 'title');
        // music
        this.intro = this.sound.add('intro');
        this.intro.play();
         // button class
        class Button {
            constructor(x, y, label, scene, callback) {
                const button = scene.add.text(x, y, label)
                    .setOrigin(0.5)
                    .setPadding(10)
                    .setStyle({ backgroundColor: '#111' })
                    .setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => callback())
                    .on('pointerover', () => button.setStyle({ fill: '#f39c12' }))
                    .on('pointerout', () => button.setStyle({ fill: '#FFF' }));
            }
        }
    
        // make button
        const button = new Button(225, 400, 'Start', this, () => 
        {
            this.intro.stop();
            this.scene.start('PlatformerScene');
        });

        // text
        this.add.text(225, 500, 'by Magnus Lindh').setOrigin(0.5);
        this.add.text(225, 600, 'Thanks to').setOrigin(0.5);
        this.add.text(225, 650, 'Michael Hadley for the Phaser tutorial,').setOrigin(0.5);
        this.add.text(225, 700, 'Robert for the Industrial Tileset,').setOrigin(0.5);
        this.add.text(225, 750, 'and Pixabay for the Sound FX').setOrigin(0.5);

     }
 }