import { config } from "./config";
import { Stage } from "./stage";

let canvas: HTMLCanvasElement = document.createElement('canvas');
canvas.width = config.gridSize * config.gridX + 100;
canvas.height = config.gridSize * config.gridY;

document.body.append(canvas);

let stage: Stage = new Stage(canvas);
stage.run();