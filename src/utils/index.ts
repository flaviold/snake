export class Vector {
    x: number;
    y: number;

    constructor (x: number, y:number) {
        this.x = x;
        this.y = y;
    }
}

export class Sensor {
    leftObstacle: number;
    upObstacle: number;
    rightObstacle: number;
    downObstacle: number;
    appleX: number;
    appleY: number;
}