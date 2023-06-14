const canvas = document.getElementById('board');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');

const MAX_MOVE_FOR_CLICK = 10;
const GRID_WIDTH = 1000;
const GRID_HEIGHT = 1000;
const SIMULATION_RATE = 4;

let grid = []
for (let x = 0; x < GRID_WIDTH; x++) {
    let a = []
    for (let y = 0; y < GRID_HEIGHT; y++) {
        a.push(false);
    }
    grid.push(a)
}
grid[1][1] = true;
console.log(grid);

let cameraX = 5000;
let cameraY = 5000;

let mouseX = 0;
let mouseY = 0;
let previousMouseX = 0;
let previousMouseY = 0;
let mousePressed = false;
let simulating = false;

let mouseMovement = 0;

function mouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    let deltaX = mouseX - previousMouseX;
    let deltaY = mouseY - previousMouseY;

    // Camera movements
    if (mousePressed) {
        cameraX -= deltaX;
        cameraY -= deltaY;
        requestAnimationFrame(draw);
    }

    mouseMovement += 1;

    previousMouseX = mouseX;
    previousMouseY = mouseY;
}
function mouseDown(e) {
    mousePressed = true;
    mouseMovement = 0;

}
function mouseUp(e) {
    mousePressed = false;
    console.log("moved " + mouseMovement);
    if (mouseMovement <= MAX_MOVE_FOR_CLICK) {
        click()
    }
}

function click() {
    // Toggles the square
    let x = Math.floor((mouseX + cameraX) / 10);
    let y = Math.floor((mouseY + cameraY) / 10);
    grid[x][y] = !grid[x][y];

    // Stops simulating
    simulating = false;

    console.log("toggled " + x + " " + y);
    requestAnimationFrame(draw);
}

function draw() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Camera adjustments
    context.translate(-cameraX, -cameraY);

    // Set the fill style
    context.fillStyle = '#ddd';

    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (grid[x][y]) {
                context.fillRect(x * 10, y * 10, 10, 10);
            }
        }
    }

    // Reset camera adjustments
    context.translate(cameraX, cameraY);
}

function keyUp(e) {
    if (e.key === " ") {
        toggleUpdateLoop()
    }
}

function toggleUpdateLoop() {
    simulating = !simulating;
    updateLoop();
}

function updateLoop() {
    if (simulating) {
        update();
        setTimeout(updateLoop, 1000 / SIMULATION_RATE);
    }
}

function update() {
    console.log("update")
    let newGrid = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
        let a = []
        for (let y = 0; y < GRID_HEIGHT; y++) {
            let totalSurrounding = 0;
            for (let ix = -1; ix < 2; ix++) {
                for (let iy = -1; iy < 2; iy++) {
                    if (!(ix === 0 && iy === 0)) {
                        totalSurrounding += getGrid(x + ix, y + iy);
                    }
                }
            }
            a.push(grid[x][y] && totalSurrounding > 1 && totalSurrounding < 4 || !grid[x][y] && totalSurrounding === 3);
        }
        newGrid.push(a);
    }
    grid = newGrid;
    requestAnimationFrame(draw);
}

function getGrid(x, y) {
    if (x < GRID_WIDTH && x >= 0 && y < GRID_HEIGHT && y >= 0) {
        return grid[x][y];
    } else {
        return false;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

canvas.addEventListener('mousemove', mouseMove);
canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('mouseup', mouseUp);
document.addEventListener("keyup", keyUp);

requestAnimationFrame(draw);