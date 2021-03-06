console.log('page refreshed');
/*
-----------------Initialization of elements-----------------
*/

//Drawing canvas initialization
const canvas = document.getElementById('draw');
canvas.width = 1280;
canvas.height = 720;
const context = canvas.getContext('2d');

//Camera canvas initialization
const cam = document.getElementById('canvas');
cam.width = 1280;
cam.height = 720;
const ctx = cam.getContext('2d');

/*
-----------------Drawing section start-----------------
*/
var bw = 1280;
var bh = 720;
var p = 0;
var cw = bw + p * 2 + 1;
var ch = bh + p * 2 + 1;

var drawl = document.getElementById('draw-lines');
var lines = drawl.getContext('2d');
function drawBoard() {
  for (var x = 0; x <= bh; x += 150) {
    lines.moveTo(p, 0.5 + x + p);
    lines.lineTo(bw + p, 0.5 + x + p);
  }

  lines.strokeStyle = '#ccc';
  lines.stroke();
}

drawBoard();

let draw_color = 'black';
let draw_width = '4';
let is_drawing = false;

let restore_array = [];
let index = -1;

function change_color(elmnt, clr) {
  console.log('Colour changed to ' + clr);
  draw_color = clr;
}

canvas.addEventListener('touchstart', start_mouse, false); //touchstart event occurs when the user touches an element
canvas.addEventListener('touchmove', draw_mouse, false); //touchmove occurs when the user moves the finger across the screen
canvas.addEventListener('mousedown', start_mouse, false); //mousedown event occurs when a user presses a mouse button over an element
canvas.addEventListener('mousemove', draw_mouse, false); //mousemove event occurs when the pointer is moving while it is over an element

canvas.addEventListener('touchend', stop_mouse, false); //touchend occurs when the user removes the finger from an element
canvas.addEventListener('mouseup', stop_mouse, false); //mouseup event occurs when a user releases a mouse button over an element
canvas.addEventListener('mouseout', stop_mouse, false); //mouseout event occurs when the mouse pointer is moved out of an element

/*
Mousedown => Index only
Mouseup => Index+Middle
Mouseout => results.multiHandLandmarks!=undefined
Mousemove => Obviously hand move
*/

function start_mouse(event) {
  is_drawing = true;
  var BB = canvas.getBoundingClientRect();
  context.beginPath();
  context.moveTo(event.clientX - BB.left, event.clientY - BB.top);
  event.preventDefault();
}

function draw_mouse(event) {
  if (is_drawing) {
    var BB = canvas.getBoundingClientRect();
    context.lineTo(event.clientX - BB.left, event.clientY - BB.top);
    context.strokeStyle = draw_color;
    context.lineWidth = draw_width;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
  }
  event.preventDefault();
}

function stop_mouse(event) {
  if (is_drawing) {
    context.stroke();
    context.closePath();
    is_drawing = false;
  }
  event.preventDefault();

  if (event.type != 'mouseout') {
    restore_array.push(context.getImageData(0, 0, canvas.width, canvas.height));
    index += 1;
  }
}

function clear_canvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  restore_array = [];
  index = -1;
  clear();
  document.getElementById('right-arrow').innerHTML = '';
}

function undo_last() {
  if (index <= 0) {
    clear_canvas();
  } else {
    index -= 1;
    restore_array.pop();
    context.putImageData(restore_array[index], 0, 0);
  }
}

// Submit post on submit
$(document).on('submit', '#form1', function (e) {
  var canva;
  canva = document.getElementById('draw');
  document.getElementById('captured_image').value =
    canva.toDataURL('image/png');
  dataUrl = document.getElementById('captured_image').value;
  e.preventDefault();
  $.ajax({
    type: 'POST',
    url: '',
    data: {
      dataURL: $('#captured_image').val(),
      csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
    },
    beforeSend: function () {
      $('#process-alert').show();
    },
    complete: function () {
      $('#process-alert').hide();
    },
    success: function (json) {
      fetch(json);
      console.log(json); // log the returned json to the console
      json_obj = JSON.parse(json);

      let latex = '';
      let result = '';
      let graph = '';
      for (let i = 0; i < json_obj.length; i++) {
        dem(json_obj[i]['latex']);
        graph = json_obj[i]['latex'];
        latex += json_obj[i]['latex'] + ' \\quad\\rightarrow ';
        if (json_obj.length > 1 && i != json_obj.length - 1) {
          latex += ' \\\\ ';
        }
        result += json_obj[i]['result'] + ' \\\\ ';
      }
      console.log(latex, result);

      showe(latex);
      showr(result);
      showl(graph);

      console.log('success'); // another sanity check
    },

    // handle a non-successful response
    error: function (xhr, errmsg, err) {
      console.log('error', errmsg); // provide a bit more info about the error to the console
    },
  });
});

//Send the image data
var canva;
function save() {
  console.log('in');
}

// Desmos

var elt = document.getElementById('calculator');
var options = { keypad: false, expressions: false, slider: true };
var calculator = Desmos.GraphingCalculator(elt, options);

calculator.setExpression({ id: 'graph1', latex: '' });
calculator.expressions = false;

function dem(latex_exp) {
  calculator.setExpression({ id: 'graph1', latex: latex_exp });
}

// ------------------------------SHOW EXPRESSION------------------

//show expression
function showe(latex_expression) {
  let exp = '\\(\\begin{align*} ' + latex_expression + '\\end{align*}\\)';
  document.getElementById('get-latexed-expression').innerHTML = exp;
}

function showr(latex_expression) {
  let exp = '\\(\\begin{align*}' + latex_expression + '\\end{align*}\\)';
  console.log(exp);
  document.getElementById('get-result').innerText = exp;
}

//show latex
function showl(latex_expression) {
  document.getElementById('get-latex').innerHTML = latex_expression;
}

const elementToObserve = document.querySelector('#get-latexed-expression');

const observer = new MutationObserver(function () {
  MathJax.typeset();
});
//dont know what this line does tbh
observer.observe(elementToObserve, { subtree: true, childList: true });

function clear() {
  showe('');
  showr('');
  showl('');
  dem('');
}

function myAlertTop() {
  $('#page-alert').show();
  setTimeout(function () {
    $('#page-alert').hide();
  }, 2000);
}
