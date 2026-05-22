class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        const colors = ['blue', 'green', 'pink', 'purple', 'red', 'yellow'];
        const shapes = ['circle', 'rhombus', 'square'];

        for (const color of colors) {
            for (const shape of shapes) {
                if (color === 'red' && shape !== 'circle') continue;
                this.load.image(`${color}_body_${shape}`, `assets/${color}_body_${shape}.png`);
            }
        }

        this.load.image('smile_open', 'assets/face_smile_open_eye.png');
        this.load.image('smile_closed', 'assets/face_smile_closed_eye.png');
        this.load.image('frown_open', 'assets/face_frown_open_eye.png');
        this.load.image('frown_closed', 'assets/face_frown_closed_eye.png');
        this.load.image('grimace_open', 'assets/face_grimace_open_eye.png');
    }

    create() {
        this.score = 0;
        this.faces = [];
        this.inputDisabled = false;

        this.criteriaText = this.add.text(400, 36, '', {
            fontSize: '28px',
            fill: '#333',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#ffffffcc',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setDepth(100);

        this.scoreText = this.add.text(780, 16, 'Score: 0', {
            fontSize: '20px',
            fill: '#333',
            fontFamily: 'Arial'
        }).setOrigin(1, 0).setDepth(100);

        this.startRound();
    }

    getNumFaces() {
        return Math.min(5 + Math.floor(this.score / 3), 12);
    }

    pickColorForShape(shape, exclude) {
        const shapeColors = {
            circle: ['blue', 'green', 'pink', 'purple', 'red', 'yellow'],
            rhombus: ['blue', 'green', 'pink', 'purple', 'yellow'],
            square: ['blue', 'green', 'pink', 'purple', 'yellow']
        };
        const options = shapeColors[shape].filter(c => c !== exclude);
        return Phaser.Utils.Array.GetRandom(options);
    }

    pickShapeForColor(color, exclude) {
        const colorShapes = {
            blue: ['circle', 'rhombus', 'square'],
            green: ['circle', 'rhombus', 'square'],
            pink: ['circle', 'rhombus', 'square'],
            purple: ['circle', 'rhombus', 'square'],
            red: ['circle'],
            yellow: ['circle', 'rhombus', 'square']
        };
        const options = colorShapes[color].filter(s => s !== exclude);
        return Phaser.Utils.Array.GetRandom(options);
    }

    generateFace(isMatch, criteriaType, criteriaValue) {
        const colors = ['blue', 'green', 'pink', 'purple', 'red', 'yellow'];
        const expressions = ['smile', 'frown', 'grimace'];
        const shapes = ['circle', 'rhombus', 'square'];

        let fc, fs, fe;

        if (isMatch) {
            if (criteriaType === 'color') {
                fc = criteriaValue;
                fs = this.pickShapeForColor(fc);
                fe = Phaser.Utils.Array.GetRandom(expressions);
            } else if (criteriaType === 'shape') {
                fs = criteriaValue;
                fc = this.pickColorForShape(fs);
                fe = Phaser.Utils.Array.GetRandom(expressions);
            } else {
                fe = criteriaValue;
                fs = Phaser.Utils.Array.GetRandom(shapes);
                fc = this.pickColorForShape(fs);
            }
        } else {
            if (criteriaType === 'color') {
                fs = Phaser.Utils.Array.GetRandom(shapes);
                fc = this.pickColorForShape(fs, criteriaValue);
                fe = Phaser.Utils.Array.GetRandom(expressions);
            } else if (criteriaType === 'shape') {
                const availShapes = shapes.filter(s => s !== criteriaValue);
                fs = Phaser.Utils.Array.GetRandom(availShapes);
                fc = this.pickColorForShape(fs);
                fe = Phaser.Utils.Array.GetRandom(expressions);
            } else {
                const availExpressions = expressions.filter(e => e !== criteriaValue);
                fe = Phaser.Utils.Array.GetRandom(availExpressions);
                fs = Phaser.Utils.Array.GetRandom(shapes);
                fc = this.pickColorForShape(fs);
            }
        }

        return { color: fc, shape: fs, expression: fe };
    }

    startRound() {
        this.clearFaces();
        this.inputDisabled = false;

        const colors = ['blue', 'green', 'pink', 'purple', 'red', 'yellow'];
        const expressions = ['smile', 'frown', 'grimace'];
        const shapes = ['circle', 'rhombus', 'square'];

        const criteriaType = Phaser.Utils.Array.GetRandom(['color', 'expression', 'shape']);
        let criteriaValue, criteriaLabel;

        if (criteriaType === 'color') {
            criteriaValue = Phaser.Utils.Array.GetRandom(colors);
            criteriaLabel = `Find the ${criteriaValue} one!`;
        } else if (criteriaType === 'expression') {
            criteriaValue = Phaser.Utils.Array.GetRandom(expressions);
            const names = { smile: 'smiley', frown: 'frowny', grimace: 'grimacing' };
            criteriaLabel = `Find the ${names[criteriaValue]} one!`;
        } else {
            criteriaValue = Phaser.Utils.Array.GetRandom(shapes);
            const names = { circle: 'round', rhombus: 'diamond', square: 'square' };
            criteriaLabel = `Find the ${names[criteriaValue]} one!`;
        }

        this.criteriaText.setText(criteriaLabel);
        this.currentCriteria = { type: criteriaType, value: criteriaValue };

        const numFaces = this.getNumFaces();
        const matchIndex = Phaser.Math.Between(0, numFaces - 1);

        for (let i = 0; i < numFaces; i++) {
            const isMatch = (i === matchIndex);
            const face = this.generateFace(isMatch, criteriaType, criteriaValue);
            this.createFace(face.color, face.shape, face.expression, isMatch);
        }
    }

    createFace(color, shape, expression, isMatch) {
        const bodyKey = `${color}_body_${shape}`;
        const eyeState = expression === 'grimace' ? 'open' : Phaser.Utils.Array.GetRandom(['open', 'closed']);
        const faceKey = `${expression}_${eyeState}`;

        const container = this.add.container(0, 0);
        const body = this.add.image(0, 0, bodyKey);
        const face = this.add.image(0, 0, faceKey);
        container.add([body, face]);

        container.x = Phaser.Math.Between(60, 740);
        container.y = Phaser.Math.Between(120, 540);

        const speed = 50 + this.score * 2;
        container.vx = (Math.random() > 0.5 ? 1 : -1) * Phaser.Math.Between(speed * 0.5, speed);
        container.vy = (Math.random() > 0.5 ? 1 : -1) * Phaser.Math.Between(speed * 0.5, speed);

        container.setSize(body.width, body.height);
        container.setInteractive();

        container.on('pointerdown', () => {
            if (this.inputDisabled) return;

            if (isMatch) {
                this.inputDisabled = true;
                this.score++;
                this.scoreText.setText('Score: ' + this.score);
                this.cameras.main.flash(300, 0, 255, 0);
                this.clearFaces();
                this.time.delayedCall(400, () => this.startRound());
            } else {
                this.cameras.main.flash(200, 255, 0, 0);
                this.tweens.add({
                    targets: container,
                    x: container.x - 10,
                    duration: 50,
                    yoyo: true,
                    repeat: 3
                });
            }
        });

        this.faces.push({ container, isMatch });
    }

    clearFaces() {
        for (const face of this.faces) {
            face.container.destroy();
        }
        this.faces = [];
    }

    update(time, delta) {
        const dt = delta / 1000;
        const padX = 40;
        const topY = 90;
        const botY = 560;

        for (const face of this.faces) {
            const c = face.container;
            c.x += c.vx * dt;
            c.y += c.vy * dt;

            if (c.x < padX) { c.vx = Math.abs(c.vx); c.x = padX; }
            if (c.x > 800 - padX) { c.vx = -Math.abs(c.vx); c.x = 800 - padX; }
            if (c.y < topY) { c.vy = Math.abs(c.vy); c.y = topY; }
            if (c.y > botY) { c.vy = -Math.abs(c.vy); c.y = botY; }
        }
    }
}
