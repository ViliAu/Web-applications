import "./styles.css";

// Game vars
var width = 7;
var height = 7;
var turn = "X";
var table = document.getElementById("board");
var cells = table.getElementsByTagName("td");
var canPlay = true;
var started = false;

// Mouse vars
var clicked = false;
var moving = false;
var moveAmountX = 0;
var moveAmountY = 0;
var scale = 1;

function createTable() {
  canPlay = true;
  for (var i = 0; i < height; i++) {
    table.insertRow(i);
    for (var j = 0; j < width; j++) {
      table.rows.item(i).insertCell(j).innerHTML = "<button></button>";
    }
  }
  cells = table.getElementsByTagName("td");
  setCellListeners();
  setupMouse();
}

function setCellListeners() {
  cells = table.getElementsByTagName("td");
  for (var j = 0; j < cells.length; j++) {
    cells[j].addEventListener("click", function() {
      handleClick(this.parentNode.rowIndex, this.cellIndex);
    });
  }
}

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
      table.style.transform +=
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
    table.style.transform = "scale(" + scale + ", " + scale + ")";
  });
}

function handleClick(posY, posX) {
  // Check if the click is valid
  if (posX == null || posY == null) {
    return;
  }
  if (getCell(posY, posX).innerHTML !== "") {
    return;
  }
  if (moving) {
    return;
  }
  if (!canPlay) {
    return;
  }
  if (!started) {
    started = true;
  }

  // Change the button text to either X or O and change bg color
  editCell(posY, posX);

  // Check if the player won
  if (checkWin(posY, posX)) {
    canPlay = false;
    document.getElementById("summary").innerHTML = turn + " won!";
    return;
  }

  // Check if the table needs expanding
  checkExpanding(posY, posX);

  // Change turns and update summary
  turn = turn === "X" ? "O" : "X";
  document.getElementById("summary").innerHTML = turn + "'s turn.";
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

function editCell(posY, posX) {
  var cell = getCell(posY, posX);
  cell.innerHTML = turn;
  cell.style.backgroundColor =
    turn === "X" ? "rgb(124, 252, 0)" : "rgb(250, 128, 114)";
}

function getCell(posY, posX) {
  return table.rows[posY].getElementsByTagName("button")[posX];
}

function addRow(amount, down) {
  for (var i = 0; i < amount; i++) {
    if (down) {
      table.insertRow(-1);
    } else {
      table.insertRow(0);
    }
    for (var j = 0; j < width; j++) {
      if (down) {
        table.rows[height].insertCell(j).innerHTML = "<button></button>";
      } else {
        table.rows[0].insertCell(j).innerHTML = "<button></button>";
      }
    }
    height++;
  }
  setCellListeners();
}

function addColumn(amount, right) {
  for (var i = 0; i < amount; i++) {
    for (var j = 0; j < table.rows.length; j++) {
      if (right) {
        table.rows[j].insertCell(width).innerHTML = "<button></button>";
      } else {
        table.rows[j].insertCell(0).innerHTML = "<button></button>";
      }
    }
    width++;
  }
  setCellListeners();
}

createTable();
