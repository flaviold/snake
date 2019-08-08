import { Vector, Sensor } from "./utils/index";
import { Stage } from "./stage";
import { config } from "./config";

export class Player {
    body: Array<Vector> = [];
    stage: Stage;
    speed: Vector;
    nxtSpeed: Vector;
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
    }

    update() {
        this.speed.x = this.nxtSpeed.x;
        this.speed.y = this.nxtSpeed.y;
        let previous = null;
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
        
        this.captureSensorValues();
    }

    captureSensorValues() {
        let positionX = this.body[0].x;
        let positionY = this.body[0].y;
        
        // left
        this.sensor.leftObstacle = 1
        while (!this.checkCollisions({ x: positionX - this.sensor.leftObstacle, y: positionY })) {
            this.sensor.leftObstacle++;
        }

        // up
        this.sensor.upObstacle = 1
        while (!this.checkCollisions({ x: positionX, y: positionY - this.sensor.upObstacle })) {
            this.sensor.upObstacle++;
        }

        // rigth
        this.sensor.rightObstacle = 1
        while (!this.checkCollisions({ x: positionX + this.sensor.rightObstacle, y: positionY })) {
            this.sensor.rightObstacle++;
        }

        // up
        this.sensor.downObstacle = 1
        while (!this.checkCollisions({ x: positionX, y: positionY + this.sensor.downObstacle })) {
            this.sensor.downObstacle++;
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
}