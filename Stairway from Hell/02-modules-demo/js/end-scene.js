export default class EndScene extends Phaser.Scene {
    constructor () {
        super({key: 'EndScene'});
    } 
    create(){
        // text
        this.add.text(225, 300, 'Thanks for playing!').setOrigin(0.5);

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
            //this.intro.stop();
            this.scene.start('PlatformerScene');
        });
    }
}  