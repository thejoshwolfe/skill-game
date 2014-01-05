var canvas = document.getElementById("game");
var scoreSpan = document.getElementById("score");
requestAnimationFrame(update);

var boxSize = 40;

var letters, boxes, boxSpeed, score;
reset();
function reset() {
  letters = [];
  boxes = [];
  boxSpeed = 30 / 1000;
  score = 0;
}

function update() {
  physicsStep();
  render();
  requestAnimationFrame(update);
}
var defaultStartingPoint = canvas.height - boxSize / 2;
var lastPhysicsTime = new Date();
function physicsStep() {
  var now = new Date();
  var dt = now - lastPhysicsTime;
  lastPhysicsTime = now;
  if (letters.length < 4) return;

  boxes.forEach(function(box) {
    box.y -= dt * boxSpeed;
  });
  var lastBox = null;
  var startingPoint = defaultStartingPoint;
  if (boxes.length > 0) {
    var firstBox = boxes[0];
    if (firstBox.y <= boxSize) {
      alert("your score: " + score);
      reset();
      return;
    }
    if (firstBox.y >= defaultStartingPoint) {
      // scoot the out of sight boxes into view.
      var delta = firstBox.y - defaultStartingPoint;
      boxes.forEach(function(box) {
        box.y -= delta;
      });
    }
    lastBox = boxes[boxes.length - 1];
    startingPoint = lastBox.y + boxSize / 2;
  }
  while (lastBox == null || lastBox.y < canvas.height) {
    generateRun().forEach(function(index) {
      var box = {
        index: index,
        y: startingPoint,
      };
      boxes.push(box);
      lastBox = box;
      startingPoint += boxSize / 2;
    });
  }
}
function breakBox() {
  boxes.splice(0, 1);
  boxSpeed += 0.001;
  score += 1;
  scoreSpan.innerHTML = score;
}
function mistake() {
  boxes.forEach(function(box) {
    box.y -= boxSize / 2;
  });
}

var lastIndex = randInt(4);
function generateRun() {
  function getNextIndex(distance) {
    var delta = (randInt(2) - 0.5) * 2 * distance;
    lastIndex = lastIndex + delta;
    if (lastIndex < 0) lastIndex += 2 * distance;
    if (lastIndex >= 4) lastIndex -= 2 * distance;
    return lastIndex;
  }
  var result = [];
  // jump
  result.push(getNextIndex(2));
  // and then wiggle
  for (var i = 0; i < randInt(3) + 2; i++) {
    result.push(getNextIndex(1));
  }
  return result;
}

function render() {
  var context = canvas.getContext("2d");
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  letters.forEach(function(c, index) {
    context.fillStyle = "#fff";
    context.font = boxSize + "pt Calibri";
    context.fillText(c, index * boxSize, boxSize);
  });

  context.beginPath();
  context.moveTo(0, boxSize);
  context.lineTo(canvas.width, boxSize);
  context.strokeStyle = "#fff";
  context.stroke();

  boxes.forEach(function(box) {
    var x = box.index * boxSize, y = box.y;

    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + boxSize, y);
    context.lineTo(x + boxSize, y + boxSize);
    context.lineTo(x, y + boxSize);
    context.lineTo(x, y);
    context.strokeStyle = "#fff";
    context.stroke();

    context.fillStyle = "#fff";
    context.font = boxSize + "pt Calibri";
    context.fillText(letters[box.index], x, y + boxSize);
  });
}

document.onkeydown = keyDown;
function keyDown(event) {
  var key = String.fromCharCode(event.which);
  if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(key) === -1) {
    // gotta be letters
    return;
  }
  if (letters.length < 4) {
    // setup
    if (letters.filter(function(c) { return key === c; }).length === 0) {
      letters.push(key);
    }
    event.preventDefault();
    return;
  }

  var index = letters.indexOf(key);
  if (index === -1) return;
  // it's a real button
  event.preventDefault();
  if (boxes.length === 0) return;
  var box = boxes[0];
  if (box.index === index) {
    breakBox();
  } else {
    mistake();
  }
}

function randInt(n) {
  return Math.floor(Math.random() * n);
}
