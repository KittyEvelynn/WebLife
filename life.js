const canvas = document.getElementById('board');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');

const MAX_MOVE_FOR_CLICK = 10;
const GRID_WIDTH = 500;
const GRID_HEIGHT = 500;
const SIMULATION_RATE = 4;
const SQUARE_SIZE = 20;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;

let grid = []
for (let x = 0; x < GRID_WIDTH; x++) {
    let a = []
    for (let y = 0; y < GRID_HEIGHT; y++) {
        a.push(false);
    }
    grid.push(a)
}

let cameraX = GRID_WIDTH / 2 * SQUARE_SIZE - canvas.width / 2;
let cameraY = GRID_HEIGHT / 2 * SQUARE_SIZE - canvas.height / 2;
let cameraZoom = 1;
let squareSize = SQUARE_SIZE;

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
    if (mouseMovement <= MAX_MOVE_FOR_CLICK) {
        click()
    }
}

function click() {
    // Toggles the square
    let x = Math.floor((mouseX + cameraX) / squareSize);
    let y = Math.floor((mouseY + cameraY) / squareSize);
    grid[x][y] = !grid[x][y];

    // Stops simulating
    simulating = false;

    requestAnimationFrame(draw);
}

function scroll(e) {
    // Check the scroll direction
    const delta = e.deltaY > 0 ? 0.1 : -0.1;

    let newCameraZoom = Math.max(Math.min(cameraZoom + delta, MAX_ZOOM), MIN_ZOOM);

    // Adjust camera FIX THIS SO IT STAYS AT THE SAME SPOT RELATIVE TO THE CAMERA
    cameraX = (cameraX + canvas.width / 2) / (GRID_WIDTH * SQUARE_SIZE / cameraZoom) * (GRID_WIDTH * SQUARE_SIZE / newCameraZoom) - canvas.width / 2
    cameraY = (cameraY + canvas.height / 2) / (GRID_HEIGHT * SQUARE_SIZE / cameraZoom) * (GRID_HEIGHT * SQUARE_SIZE / newCameraZoom) - canvas.height / 2

    // Update the zoom level
    cameraZoom = newCameraZoom;
    squareSize = SQUARE_SIZE / cameraZoom;

    requestAnimationFrame(draw);
    e.preventDefault();
}

function draw() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Camera adjustments
    context.translate(-cameraX, -cameraY);

    // Fill grid bg
    context.fillStyle = "rgb(21, 32, 43)";
    context.fillRect(0, 0, GRID_WIDTH * squareSize, GRID_HEIGHT * squareSize);
    // Fill the squares
    context.fillStyle = '#ddd';
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (grid[x][y]) {
                context.fillRect(x * squareSize, y * squareSize, squareSize + 1, squareSize + 1);
            }
        }
    }

    // Reset camera adjustments
    context.setTransform(1, 0, 0, 1, 0, 0);
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
canvas.addEventListener('dragstart', mouseDown);
canvas.addEventListener('mouseup', mouseUp);
canvas.addEventListener('dragend', mouseUp);
document.addEventListener("keyup", keyUp);
canvas.addEventListener('wheel', scroll);

requestAnimationFrame(draw);