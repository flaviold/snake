import { config } from "./config";
import { Player } from "./player";
import { Vector } from "./utils/index";

export class Stage {
    map: Array<Array<any>> = [];
    context: CanvasRenderingContext2D;
    player: Player;
    apple: Vector;
    loop: boolean = true;
    
    constructor(canvas: HTMLCanvasElement) {
        this.context = canvas.getContext('2d');
        this.initializeMap();
        this.drawMap();
        this.putApple();
        this.player = new Player(this);
        this.initializeKeyEvents();
    }
    
    initializeMap() {
        this.map = [];
        for (let i = 0; i < config.gridX; i++) {
            this.map[i] = [];
            for (let j = 0; j < config.gridY; j++) {
                if (i === 0 || i === config.gridX - 1 || j === 0 || j === config.gridY - 1) {
                    this.map[i][j] = 1;
                    continue;
                }
                this.map[i][j] = 0;
            }
        }
    }

    putApple() {
        if (this.apple) {
            this.map[this.apple.x][this.apple.y] = 0    
        }

        let apple = new Vector(Math.floor(Math.random() * (config.gridX - 2)) + 1, Math.floor(Math.random() * (config.gridX - 2)) + 1);
        this.map[apple.x][apple.y] = 2

        this.apple = apple;
    }

    drawMap() {
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[i].length; j++) {
                let col = this.map[i][j];
                let x = i * config.gridSize;
                let y = j * config.gridSize;
                
                if (col === 1) {
                    this.context.fillStyle = '#fff';
                    this.context.fillRect(x, y, config.gridSize, config.gridSize);
                }

                if (col === 2) {
                    this.context.fillStyle = '#0f0';
                    this.context.fillRect(x, y, config.gridSize, config.gridSize);
                }

                if (config.debug) {
                    this.context.strokeStyle = '#f00';
                    this.context.strokeRect(x, y, config.gridSize, config.gridSize);
                }
            }
        }
    }

    run({x, y}: any) {
        let lastRender = 0
        let _this = this;
        let frame = function(time: number) {
            if (!_this.loop) return;
            let delta = (time - lastRender) / 1000;
            let fps = 1/delta;
            if (fps <= 10) {
                lastRender = time;
                
                _this.context.clearRect(0, 0, x, y);
                _this.context.fillStyle = '#f00';
                _this.context.fillText(fps.toFixed(), config.gridSize * config.gridX + 10, 10);
                _this.drawMap();
                _this.player.update();
                _this.player.draw();
            }
            requestAnimationFrame(frame);
        }
        requestAnimationFrame (frame);
    }

    stop() {
        this.loop = false;
    }

    initializeKeyEvents() {
        let _this = this;
        document.body.onkeydown = (e) => {
            if (e.keyCode === 37) {
                this.player.left();
            } else if (e.keyCode === 38) {
                this.player.up();
            }else if (e.keyCode === 39) {
                this.player.rigth();
            }else if (e.keyCode === 40) {
                this.player.down();
            } else if (e.keyCode === 32) {
                this.player.pause();
            }
        }
    }
}