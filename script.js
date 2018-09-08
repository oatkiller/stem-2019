let context;
let canvasCoordinates;
document.addEventListener('DOMContentLoaded', function(event) {
  const canvas = document.getElementById('rendered-paths');
  context = canvas.getContext('2d')
  render(context)
  const { x, y } = canvas.getBoundingClientRect()
  canvasCoordinates = { x, y }
},false)

document.addEventListener('submit', function(event) { event.preventDefault(); }, false);

document.addEventListener('input', function(event) {
  render(context);
}, false);

document.addEventListener('click', function(event) {
  if (event.target.name === 'clone') {
    const parentRow = parentRowForElement(event.target)
    if (parentRow === null) {
      return
    }
    const newRow = parentRow.cloneNode(true);
    parentRow.parentNode.insertBefore(newRow, parentRow);
  } else if (event.target.name === 'remove') {
    const parentRow = parentRowForElement(event.target)
    if (parentRow === null) {
      return
    }
    parentRow.remove()
    render(context);
  } else if (event.target.id === 'rendered-paths') {
    console.log(
      event.pageX - canvasCoordinates.x,
      event.pageY - canvasCoordinates.y
    )
  }
}, false);

function parentRowForElement(element) {
  let parentRow = event.target
  while (parentRow.nodeName !== 'TR') {
    if (parentRow.parentNode === null) {
      console.log('error, could not add new row')
      return null
    }
    parentRow = parentRow.parentNode
  }
  return parentRow
}

function* pointValues() {
  if (Symbol.iterator in document.forms[0].points) {
    for (const { value } of document.forms[0].points) {
      yield value
    }
  } else {
    yield document.forms[0].points.value
  }
}

function* paths() {
  if (Symbol.iterator in document.forms[0].points) {
    let index = 0
    for (const { value } of document.forms[0].points) {
      yield {
        color: document.forms[0].color[index].value,
        stroke: document.forms[0].stroke[index].checked,
        points: points.bind(null, value),
      }
      index++
    }
  } else {
    yield {
      color: document.forms[0].color.value,
      stroke: document.forms[0].stroke.checked,
      points: points.bind(null, document.forms[0].points.value),
    }
  }
  
  function* points(value) {
    let point = []
    for (const number of numbers()) {
      point.push(number)
      if (point.length === 2) {
        yield point
        point = []
      }
    }

    function* numbers() {
      const match = value.match(/(\d+)/g)
      if (match !== null) {
        for (const numberString of match) {
          yield parseFloat(numberString)
        }
      }
    }
  }
}

function render(context) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  for (const { color, points, stroke } of paths()) {
    context.beginPath();
    
    let handledFirst = false 
    for (const [x,y] of points()) {
      if (handledFirst === false) {
        context.moveTo(x, y);
        handledFirst = true
      } else {
        context.lineTo(x, y);
      }
    }
    
    if (stroke) {
      context.strokeStyle = color;
      context.stroke();
    } else {
      context.fillStyle = color;
      context.fill();
    }
  }
}