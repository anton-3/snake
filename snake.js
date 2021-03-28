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
// array of all snake body cells
const snakeBody = [];
const scoreElement = document.querySelector("#score");
const highScoreElement = document.querySelector("#highscore");
const alertBox = document.querySelector("#alert-box");
const alertTitle = document.querySelector("#alert-box .alert-title");
const alertDescription = document.querySelector(
  "#alert-box .alert-description"
);
const snakeLengthPerApple = 5;
// this stuff is to prevent 180 turns
let directionAtLastMove;
let queuedTurn;
let gamesPlayed = 0;

// set highscore from localStorage if it exists
if (localStorage.getItem("highscore")) {
  highScoreElement.textContent = localStorage.getItem("highscore");
}

// keyboard support
document.onkeydown = keyControls;

// assign keydown event codes to their directions
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

function log(str) {
  document.querySelector("#console").textContent += "\n" + str;
}

function playSnake(gameSpeed = 50, height = 35, width = 45) {
  alertBox.style.display = "none";
  if (gamesPlayed > 0) resetGame();
  createGrid(height, width);
  gameLoop = setInterval(gameLoopFunc, gameSpeed);
}

function gameLoopFunc() {
  // if hasn't moved yet or the game is paused or alert box is showing
  if (!direction || paused || alertBox.style.display !== "none") return;

  const oldCell = well[headRow][headCol];
  oldCell.className = "empty";

  updateSnakeLocation();
  directionAtLastMove = direction;

  if (checkSnakeDead()) {
    endGame();
    return;
  }

  const newCell = well[headRow][headCol];
  if (newCell.className === "apple") eatApple();
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

  if (queuedTurn) {
    direction = queuedTurn;
    queuedTurn = null;
  }
}

function eatApple() {
  score += snakeLengthPerApple;
  pendingLength += snakeLengthPerApple;
  makeNewApple();
  updateScoreboard();
}

function updateScoreboard() {
  scoreElement.textContent = score.toString();
  if (score > parseInt(highScoreElement.textContent)) {
    highScoreElement.textContent = score.toString();
    localStorage.setItem("highscore", score.toString());
  }
}

function keyControls(e) {
  // if game is unpaused and the key pressed is a direction key and alert box is hidden
  if (!paused && keys[e.code] && alertBox.style.display === "none") {
    e.preventDefault();
    if (queuedTurn) return;
    const code = keys[e.code];
    if (
      score !== 0 &&
      ((direction === "up" && code === "down") ||
        (direction === "right" && code === "left") ||
        (direction === "down" && code === "up") ||
        (direction === "left" && code === "right"))
    ) {
      // if snake has any body AND tries to turn opposite its current direction
      return;
    }
    if (
      score !== 0 &&
      ((directionAtLastMove === "up" && code === "down") ||
        (directionAtLastMove === "right" && code === "left") ||
        (directionAtLastMove === "down" && code === "up") ||
        (directionAtLastMove === "left" && code === "right"))
    ) {
      // if snake has any body AND its previous direction
      // was opposite the direction it's trying to turn
      queuedTurn = code;
      return;
    }

    direction = keys[e.code];
  } else if (e.code === "Escape") {
    playOrPause();
  } else if (e.code === "Enter" && alertBox.style.display !== "none") {
    playSnake();
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
    // hits a wall
    headRow < 0 ||
    headCol < 0 ||
    headRow >= well.length ||
    headCol >= well[0].length ||
    // hits a snake body
    snakeBody.includes(well[headRow][headCol])
  ) {
    return true;
  }
  return false;
}

function endGame() {
  clearInterval(gameLoop);
  gamesPlayed++;
  makeDeadHead();
  alertTitle.textContent = "You died :(";
  alertDescription.textContent = "Play again?";
  setTimeout(() => {
    alertBox.style.display = "";
  }, 500);
}

function resetGame() {
  direction = null;
  if (paused) playOrPause();
  headRow = 3;
  headCol = 3;
  score = 0;
  updateScoreboard();
  pendingLength = 0;
  snakeBody.length = 0;
  directionAtLastMove = null;
  queuedTurn = null;
  well.length = 0;
  document.querySelector("#main").remove();
}

// make the snake head gray when it dies
function makeDeadHead() {
  if (well[headRow] && well[headRow][headCol]) {
    // if snake head died inside the grid
    well[headRow][headCol].className = "dead-snake-head";
  } else {
    // if snake died by hitting a wall
    const deadHead = document.createElement("div");
    deadHead.style.height = deadHead.style.width = "1em";
    deadHead.style.position = "relative";
    deadHead.className = "dead-snake-head";
    // lastsquare is the last square the head was on before dying
    let lastSquare;

    switch (directionAtLastMove) {
      case "left":
        lastSquare = well[headRow][headCol + 1];
        lastSquare.appendChild(deadHead);
        deadHead.style.right = "1em";
        break;
      case "up":
        lastSquare = well[headRow + 1][headCol];
        lastSquare.appendChild(deadHead);
        deadHead.style.bottom = "1em";
        break;
      case "right":
        lastSquare = well[headRow][headCol - 1];
        lastSquare.appendChild(deadHead);
        deadHead.style.left = "1em";
        break;
      case "down":
        lastSquare = well[headRow - 1][headCol];
        lastSquare.appendChild(deadHead);
        deadHead.style.top = "1em";
        break;
    }
  }
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
