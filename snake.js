// array of all squares, access square through well[row][column]
// rows count top down, columns left to right
const well = [];
let gameLoop;
let direction;
// current row and column of the snake's head
let headRow = 3;
let headCol = 3;
let paused = false;
// length of snake not counting the head
let score = 0;
// length of snake that hasn't shown up on screen yet
let pendingLength = 0;
// array of all snake body cell divs
const snakeBody = [];
const scoreElement = document.querySelector("#score");
const highScoreElement = document.querySelector("#highscore");
const snakeLengthPerApple = 5;

const keys = {
  KeyA: "left",
  ArrowLeft: "left",
  KeyW: "up",
  ArrowUp: "up",
  KeyD: "right",
  ArrowRight: "right",
  KeyS: "down",
  ArrowDown: "down",
};

function playSnake(gameSpeed = 100, height = 35, width = 45) {
  // gamespeed is how many milliseconds per game loop
  // height and width for size of snake board

  createGrid(height, width);

  document.onkeydown = keyControls;

  gameLoop = setInterval(gameLoopFunc, gameSpeed);
}

function gameLoopFunc() {
  if (!direction || paused) return;

  const oldCell = well[headRow][headCol];
  oldCell.className = "empty";

  updateSnakeLocation();

  if (checkSnakeDead()) {
    endGame();
    return;
  }

  const newCell = well[headRow][headCol];
  if (newCell.className === "apple") {
    score += snakeLengthPerApple;
    pendingLength += snakeLengthPerApple;
    makeNewApple();
    updateScoreboard();
  }
  newCell.className = "snake-head";
}

function updateSnakeLocation() {
  if (score > 0) {
    if (pendingLength > 0) {
      pendingLength--;
    } else {
      snakeBody[0].className = "empty";
      snakeBody.shift();
    }
    const newBodyCell = well[headRow][headCol];
    newBodyCell.className = "snake-body";
    snakeBody.push(newBodyCell);
  }

  switch (direction) {
    case "left":
      headCol--;
      break;
    case "up":
      headRow--;
      break;
    case "right":
      headCol++;
      break;
    case "down":
      headRow++;
      break;
  }
}

function updateScoreboard() {
  scoreElement.textContent = score.toString();
  if (score > highScoreElement.textContent.parseInt()) {
    highScoreElement.textContent = score.toString();
  }
}

function keyControls(e) {
  // if game is unpaused and the key pressed is a direction key
  if (!paused && keys[e.code]) {
    e.preventDefault();
    direction = keys[e.code];
  }
}

function createGrid(height, width) {
  // apparently making the main div in js instead of html makes it like 20x faster
  const main = document.createElement("div");
  main.id = "main";

  // each square is 1 em by 1 em
  main.style.height = height.toString() + "em";
  main.style.width = width.toString() + "em";

  // rows
  for (let i = 0; i < height; i++) {
    row = [];

    // columns
    for (let j = 0; j < width; j++) {
      let cell = document.createElement("div");
      cell.style.width = cell.style.height = "1em";
      cell.className = "empty";

      if (i === headRow && j === headCol) {
        cell.className = "snake-head";
        headRow = i;
        headCol = j;
      }

      main.appendChild(cell);
      row.push(cell);
    }

    well.push(row);
  }

  document.body.appendChild(main);
  makeNewApple();
}

function getRandomCell(legalSquares) {
  // get a random index in the array of all legal squares
  const index = Math.floor(Math.random() * legalSquares.length);
  return legalSquares[index];
}

function getLegalSquares() {
  return Array.from(document.getElementsByClassName("empty"));
}

function makeNewApple() {
  const legalSquares = getLegalSquares();
  if (legalSquares.length === 0) return;
  newAppleCell = getRandomCell(legalSquares);
  newAppleCell.className = "apple";
}

function checkSnakeDead() {
  if (
    headRow < 0 ||
    headCol < 0 ||
    headRow >= well.length ||
    headCol >= well[0].length
  ) {
    return true;
  }
}

function endGame() {
  clearInterval(gameLoop);
  alert("you died :(");
}

function playOrPause() {
  const btn = document.querySelector("#play-pause");
  if (paused) {
    paused = false;
    btn.src = "img/pause.png";
  } else {
    paused = true;
    btn.src = "img/play.png";
  }
}
