import { Vector, Sensor } from "./utils/index";
import { Stage } from "./stage";
import { config } from "./config";

export class Player {
    body: Array<Vector> = [];
    stage: Stage;
    speed: Vector;
    nxtSpeed: Vector;
    grow: boolean = false;
    sensor: Sensor = new Sensor();
    color: string = '#eee';

    constructor(stage: Stage) {
        let x = Math.floor(config.gridX / 2);
        let y = Math.floor(config.gridY / 2);
        this.body.push(new Vector(x, y));
        this.stage = stage;
        this.speed = this.nxtSpeed = new Vector(0, -1);
        this.nxtSpeed = Object.assign({}, this.speed);
    }

    draw() {
        for (const part of this.body) {
            let x = part.x * config.gridSize;
            let y = part.y * config.gridSize;

            this.stage.context.fillStyle = this.color;
            this.stage.context.fillRect(x, y, config.gridSize, config.gridSize);
            this.stage.context.strokeStyle = '#000';
            this.stage.context.strokeRect(x, y, config.gridSize, config.gridSize);
        }

        if (config.debug) {
            this.drawSensor();
        }
    }

    drawSensor() {
        let head = this.body[0]
        this.stage.context.fillStyle = '#f00';

        // left
        if (this.sensor.leftObstacle > 0) {
            this.stage.context.fillRect(head.x * config.gridSize, (head.y * config.gridSize) + (config.gridSize / 8),  (-this.sensor.leftObstacle + 1) * config.gridSize, config.gridSize / 4);
        }

        // up
        if (this.sensor.upObstacle > 0) {
            this.stage.context.fillRect((head.x * config.gridSize) + (config.gridSize / 8), head.y * config.gridSize,  config.gridSize / 4, (-this.sensor.upObstacle + 1) * config.gridSize);
        }

        // right
        if (this.sensor.rightObstacle > 0) {
            this.stage.context.fillRect((head.x + 1) * config.gridSize, (head.y * config.gridSize) + (config.gridSize / 8),  (this.sensor.rightObstacle - 1) * config.gridSize, config.gridSize / 4);
        }

        // up
        if (this.sensor.downObstacle > 0) {
            this.stage.context.fillRect((head.x * config.gridSize) + (config.gridSize / 8), (head.y + 1) * config.gridSize,  config.gridSize / 4, (this.sensor.downObstacle - 1) * config.gridSize);
        }

        this.stage.context.fillStyle = '#00f';
        
        // apple X
        let xOffset = this.sensor.appleX > 0 ? 1 : 0;
        let xwBias = this.sensor.appleX > 0 ? 0 : 2;
        let xx = (head.x + xOffset) * config.gridSize;
        let xy = (head.y * config.gridSize) + ((config.gridSize * 5) / 8);
        let xw = ((this.sensor.appleX - 1 + xwBias) * config.gridSize);
        let xh = config.gridSize / 4;
        if (this.sensor.appleX !== 0) {
            console.log(head.x + xOffset);
            this.stage.context.fillRect(xx, xy, xw, xh)
        }

        this.stage.context.fillStyle = '#0ff';
        // apple Y
        if (this.sensor.appleY !== 0) {
            let offset = this.sensor.appleY < 0 ? 0 : 1;
            let wBias = this.sensor.appleY > 0 ? 0 : 2;
            let x = (xx + xw );
            let y = (head.y + offset) * config.gridSize;
            let w = config.gridSize / 4;
            let h = ((this.sensor.appleY - 1 + wBias) * config.gridSize);
            console.log(head.x + offset);
            this.stage.context.fillRect(x, y, w, h)
        }
    }

    update() {
        this.speed.x = this.nxtSpeed.x;
        this.speed.y = this.nxtSpeed.y;
        let previous = null;

        if (this.grow) {
            this.body.push(new Vector(0, 0));
            this.grow = false;
        }
        
        for (const [i, part] of this.body.entries()) {
            if (i === 0) {
                previous = Object.assign({}, part);
                part.x += this.speed.x;
                part.y += this.speed.y;
                continue;
            }
            let newPos = Object.assign({}, previous);
            previous = Object.assign({}, part);
            part.x = newPos.x;
            part.y = newPos.y;
        }

        //check map collision
        if (this.checkCollisions(this.body[0])) {
            this.stage.stop();
            this.body = [];
            return;
        }

        this.checkApple(this.body[0]);
        
        this.captureSensorValues();
    }

    captureSensorValues() {
        let positionX = this.body[0].x;
        let positionY = this.body[0].y;
        
        // left
        this.sensor.leftObstacle = 0
        while (!this.checkCollisions({ x: positionX - this.sensor.leftObstacle, y: positionY })) {
            this.sensor.leftObstacle++;
        }

        // up
        this.sensor.upObstacle = 0
        while (!this.checkCollisions({ x: positionX, y: positionY - this.sensor.upObstacle })) {
            this.sensor.upObstacle++;
        }

        // rigth
        this.sensor.rightObstacle = 0
        while (!this.checkCollisions({ x: positionX + this.sensor.rightObstacle, y: positionY })) {
            this.sensor.rightObstacle++;
        }

        // up
        this.sensor.downObstacle = 0
        while (!this.checkCollisions({ x: positionX, y: positionY + this.sensor.downObstacle })) {
            this.sensor.downObstacle++;
        }

        // apple
        this.sensor.appleX = this.stage.apple.x - positionX;
        this.sensor.appleY = this.stage.apple.y - positionY;

        console.log(this.sensor.appleX);
    }

    checkApple({x, y}: any) {
        if (this.stage.map[x][y] === 2) {
            this.grow = true;
            this.stage.putApple();
        }
    }

    checkCollisions({ x, y }: any) {
        //check map collision
        if (this.stage.map[x][y] === 1) return true;

        //check body collision
        for (const [i, part] of this.body.entries()) {
            if (part.x === x && part.y === y && i !== 0) return true;
        }

        return false;
    }

    up() {
        if (this.speed.y === 1) return;
        this.nxtSpeed.x = 0;
        this.nxtSpeed.y = -1;
    }

    down() {
        if (this.speed.y === -1) return;
        this.nxtSpeed.x = 0;
        this.nxtSpeed.y = 1;
    }

    left() {
        if (this.speed.x === 1) return;
        this.nxtSpeed.x = -1;
        this.nxtSpeed.y = 0;
    }

    rigth() {
        if (this.speed.x === -1) return;
        this.nxtSpeed.x = 1;
        this.nxtSpeed.y = 0;
    }

    pause() {
        this.nxtSpeed.x = 0;
        this.nxtSpeed.y = 0;
    }
}