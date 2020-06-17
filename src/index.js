import "./styles.css";
import "./w3.css";
import "./materialize.css";

// Game vars
var width = 5;
var height = 5;
var turn = "x";
var timer = 10;
var timerFunc = null;
var canPlay = true;

// Elements
var board = document.getElementById("board");
var cells = board.getElementsByClassName("col");
var progressBar = document.getElementById("progress_container");

// Mouse vars
var clicked = false;
var moving = false;
var moveAmountX = 0;
var moveAmountY = 0;
var scale = 1;

function createTable() {
  for (var i = 0; i < height; i++) {
    // Create a row child and add it to the grid
    let row = document.createElement("div");
    row.className = "row";
    board.appendChild(row);

    for (var j = 0; j < width; j++) {
      // Create a cell child and add it to the row
      let cell = document.createElement("div");
      cell.className = "col s1";
      //cell.id = "tile";
      cell.innerHTML = "<button id = \"tile\"/>";
      board.getElementsByClassName("row")[i].appendChild(cell);
    }
  }
  cells = board.getElementsByClassName("col");
  updateCellListeners();
  setupMouse();
}

function updateCellListeners() {
  // Get cells
  cells = board.getElementsByClassName("col");

  /* Set a listener to cells without an attribute
   * called 'clickable' that is true
   */
  for (let i = 0; i < board.getElementsByClassName("row").length; i++) {
    for (let j = 0;
      j < board.getElementsByClassName("row")[i]
      .getElementsByClassName("col").length; j++) {
        board.getElementsByClassName("row")[i]
        .getElementsByClassName("col")[j].addEventListener("click", function() {
        handleClick(i, j);
      });
    }
  }
}

// This procedure handles mouse events
function setupMouse() {
  // Mouse down listener
  document.addEventListener("mousedown", function(event) {
    // Disable middle click action
    event.preventDefault();
    // Setup vars
    clicked = true;
    moving = false;
    moveAmountX = 0;
    moveAmountY = 0;
  });
  // Mouse move listener
  document.addEventListener("mousemove", function(event) {
    if (clicked) {
      moveAmountX += event.movementX;
      moveAmountY += event.movementY;
      if (Math.abs(moveAmountX) > 10 || Math.abs(moveAmountY) > 10) {
        moving = true;
      }
      board.style.transform +=
        "translate(" +
        event.movementX * 0.8 +
        "px, " +
        event.movementY * 0.8 +
        "px)";
    }
  });
  // Mouse up listener
  document.addEventListener("mouseup", function() {
    clicked = false;
  });
  // Prevent context menu from showing
  document.oncontextmenu = function(event) {
    event.preventDefault();
  };
  // Scroll wheel listener
  document.addEventListener("wheel", function(event) {
    // Calculate scale
    scale += event.deltaY === -125 ? 0.1 : -0.1;
    // Clamp scale
    scale = scale < 0.5 ? 0.5 : scale > 1.5 ? 1.5 : scale;
    // Apply scale
    board.style.transform = "scale(" + scale + ", " + scale + ")";
  });
}

function handleClick(posY, posX) {
  console.log(posY + " "+posX);
  // Check if the click is valid
  if (posX == null || posY == null) {
    return;
  }
  /* Other check conditions disabled
   * So that the code supports multiple executions
   */
  if (getCell(posY, posX).innerHTML !== "") {
    return;
  }
  if (moving) {
    return;
  }
  if (!canPlay) {
    return;
  }
  // Change the button text to either X or O and change bg color
  editCell(posY, posX);

  // Check if the player won
  if (checkWin(posY, posX)) {
    canPlay = false;
    document.getElementById("summary").innerHTML = turn + " won!";
    clearInterval(timerFunc);
    document.getElementById("progress").style.visibility = "hidden";
    return;
  }
  // Check if the table needs expanding
  //checkExpanding(posY, posX);

  // Change turns and update summary
  changeTurn();
}

function editCell(posY, posX) {
  var cell = getCell(posY, posX);
  cell.innerHTML = turn;
  cell.style.backgroundColor =
    turn === "x" ? "rgb(124, 252, 0)" : "rgb(250, 128, 114)";
}

function getCell(posY, posX) {
  return board
    .getElementsByClassName("row")[posY]
    .getElementsByClassName("col")[posX]
    .getElementsByTagName("button")[0];
}

function checkWin(posY, posX) {
  var score = 1;
  var contains;

  /* Check vertical winning condition
   * First checks up, then down
   * then checks ascending diagonal in a similar manner
   * Then checks other 2 dirs (horizontal and descending diagonal.)
   */

  // Defines orientation (vertical, horizontal...)
  for (let i = 0; i < 4; i++) {
    // Defines direction (up, down...)
    for (let j = 0; j < 2; j++) {
      // Defines the tile we're currently checking
      for (let k = 1; k < 5; k++) {
        // Error prevention for going outside board
        try {
          // change direction if necessary
          let dir = j === 0 ? k : -k;
          // Define the orientation we need to check the tiles
          switch (i) {
            case 0:
              contains = getCell(posY - dir, posX).innerHTML;
              break;
            case 1:
              contains = getCell(posY - dir, posX + dir).innerHTML;
              break;
            case 2:
              contains = getCell(posY, posX + dir).innerHTML;
              break;
            case 3:
              contains = getCell(posY + dir, posX + dir).innerHTML;
              break;
            default:
              break;
          }
        } catch {
          break;
        }
        if (contains === turn) {
          score++;
        } else {
          break;
        }
      }
    }
    if (score >= 5) {
      return true;
    } else {
      score = 1;
    }
  }
}

function checkExpanding(posY, posX) {
  //down
  if (posY >= height - 4) {
    addRow(4 - (height - posY), true);
  }
  //up
  if (posY < 4) {
    addRow(3 - posY, false);
  }
  // right
  if (posX >= width - 4) {
    addColumn(4 - (width - posX), true);
  }
  //left
  if (posX < 4) {
    addColumn(3 - posX, false);
  }
}

function addRow(amount, down) {
  for (var i = 0; i < amount; i++) {
    // Create a cell child and add it to the row
    let row = document.createElement("div");
    row.className = "row";
    //cell.id = "tile";
    if (down) {
      board.appendChild(row);
    } else {
      board.insertBefore(row, board.childNodes[0]);
    }
    for (var j = 0; j < width; j++) {
      let col = document.createElement("div");
      col.className = "col";
      if (down) {
        board.getElementsByClassName("row")[board.getElementsByClassName("row").length-1]
        .appendChild(col).innerHTML =
          '<button id = "tile"></button>';
      } else {
        board.getElementsByClassName("row")[0]
        .appendChild(col).innerHTML = '<button id = "tile"></button>';
      }
    }
    height++;
  }
  updateCellListeners();
}

function addColumn(amount, right) {
  for (var i = 0; i < amount; i++) {
    for (var j = 0; j < board.getElementsByClassName("row").length; j++) {
      let cell = document.createElement("div");
      cell.className = "col s1";
      if (right) {
        board.getElementsByClassName("row")[j]
        .appendChild(cell).innerHTML =
          '<button id = "tile"></button>';
      } else {
        board.getElementsByClassName("row")[j]
        .insertBefore(cell, board.getElementsByClassName("row")[j]
        .childNodes[0])
        .innerHTML = '<button id = "tile"></button>';
      }
    }
    width++;
  }
  updateCellListeners();
}

function changeTurn() {
  if (timerFunc != null) {
    clearInterval(timerFunc);
  } else {
    document.getElementById("progress").style.visibility = "visible";
  }
  turn = turn === "x" ? "o" : "x";
  document.getElementById("summary").innerHTML = turn + "'s turn.";
  // Start the timer on the first move
  timer = 10;
  timerFunc = setInterval(incrementTimer, 50);
}

function incrementTimer() {
  timer -= 0.05;
  // Clamp timer
  timer = timer <= 0 ? 0 : timer;
  if (timer <= 0.04) {
    changeTurn();
  }
  progressBar.style.width = (timer / 10) * 100 + "%";
  // Limit the decimals to 1
  progressBar.innerHTML = timer.toFixed(1) + "s";
}

createTable();
