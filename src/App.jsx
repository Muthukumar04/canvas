import { useEffect, useLayoutEffect, useReducer, useState } from "react";
import rough from "roughjs";

import "./App.css";

const generator = rough.generator();

const actions = {
  drawing: "drawing",
  selection: "selection",
  resizing: "resizing",
  moving: "moving",
  none: "none",
};
const shapes = {
  line: "line",
  rectangle: "rectangle",
  none: "none",
};

function createElement(x1, y1, x2, y2, type, id) {
  let element = null;
  switch (type) {
    case shapes.line: {
      element = generator.line(x1, y1, x2, y2);
      break;
    }
    case shapes.rectangle: {
      element = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      break;
    }

    default:
      throw new Error("Invalid shape type");
  }
  return { x1, y1, x2, y2, element, type, id };
}

function distanceBetweenPoints(A, B) {
  return Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2));
}
function liesWithinElement(x, y, element) {
  switch (element.type) {
    case shapes.line: {
      const ac = distanceBetweenPoints(
        { x, y },
        { x: element.x1, y: element.y1 }
      );
      const ab = distanceBetweenPoints(
        { x: element.x1, y: element.y1 },
        { x: element.x2, y: element.y2 }
      );
      const cb = distanceBetweenPoints(
        { x, y },
        { x: element.x2, y: element.y2 }
      );
      return ac + cb <= ab + 10;
    }
    case shapes.rectangle: {
      const minX = Math.min(element.x1, element.x2);
      const minY = Math.min(element.y1, element.y2);
      const maxX = Math.max(element.x1, element.x2);
      const maxY = Math.max(element.y1, element.y2);
      const isInside = x >= minX && x <= maxX && y >= minY && y <= maxY;
      return isInside;
    }
    default:
      throw new Error(`${type} not exist`);
  }
}

//returns {x1,x2,y1,y2,element}
function updateElement(x, y, element, mode) {
  let updatedElement = null;
  let { offsetX, offsetY } = element;
  if (actions.moving === mode) {
    switch (element.type) {
      case shapes.line:
      case shapes.rectangle: {
        const width = Math.abs(element.x1 - element.x2);
        const height = Math.abs(element.y1 - element.y2);
        const x1 = x - offsetX,
          y1 = y - offsetY,
          x2 = width + x1,
          y2 = height + y1;
        updatedElement =
          shapes.rectangle === element.type
            ? generator.rectangle(x1, y1, width, height)
            : generator.line(x1, y1, x2, y2);
        return { element: updatedElement, x1, x2, y1, y2 };
      }
      default:
        throw new Error(`Invalid type - ${element.type} for ${mode}`);
    }
  } else if (actions.resizing === mode) {
  }
}

const defaultAction = { action: actions.none };

function actionReducer(state, action) {
  switch (action.type) {
    case actions.drawing: {
      return { action: action.type, shape: action.shape };
    }
    case actions.selection:
      return { action: action.type };
    default:
      return defaultAction;
  }
}

function App() {
  const [action, dispatch] = useReducer(actionReducer, defaultAction);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  useLayoutEffect(() => {
    const canvas = document.querySelector("canvas");
    const canvasCtx = canvas.getContext("2d");
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({ element }) => {
      roughCanvas.draw(element);
    });
  }, [elements]);

  function mouseDown(e) {
    const { clientX, clientY } = e;
    if (action.action === actions.selection) {
      const selectedElement = elements.find((element) =>
        liesWithinElement(clientX, clientY, element)
      );

      if (selectedElement) {
        const offsetX = clientX - selectedElement.x1,
          offsetY = clientY - selectedElement.y1;

        setSelectedElement({ ...selectedElement, offsetX, offsetY });
        // debugger;
      }
    } else if (action.action === actions.drawing && action.shape) {
      const id = elements.length;
      const createdElement = createElement(
        clientX,
        clientY,
        clientX,
        clientY,
        action.shape,
        id
      );

      setElements((p) => [...p, createdElement]);
      setSelectedElement(createdElement);
    }
  }

  function mouseMove(e) {
    const { clientX, clientY } = e;
    if (action.action === actions.drawing && action.shape && selectedElement) {
      //drawing new element
      const index = elements.length - 1;
      const currentElement = elements[index];
      const { x1, y1, id, type } = currentElement;
      const createdElement = createElement(x1, y1, clientX, clientY, type, id);
      const updatedElements = [...elements];
      updatedElements[index] = createdElement;
      setElements(updatedElements);
    } else if (action.action === actions.selection && selectedElement) {
      //selecting a element
      console.log(selectedElement);
      let updatedElement = updateElement(
        clientX,
        clientY,
        selectedElement,
        actions.moving
      );
      updatedElement = { ...selectedElement, ...updatedElement };

      setElements((p) =>
        p.map((element) =>
          element.id === updatedElement.id ? updatedElement : element
        )
      );
      // setSelectedElement(updatedElement);
    }
  }

  function updateCoordinates(element) {
    switch (element.type) {
      case shapes.line:
      case shapes.rectangle: {
        let { x1, x2, y1, y2 } = element;
        console.log(`((${x1}, ${y1} ),( ${x2}, ${y2}))`);
        if (x1 > x2 || y1 > y2) {
          let t = x1;
          x1 = x2;
          x2 = t;
          t = y1;
          y1 = y2;
          y2 = t;
        }
        console.log(`((${x1}, ${y1} ),( ${x2}, ${y2}))`);
        return createElement(x1, y1, x2, y2, element.type, element.id);
      }
      default:
        throw new Error("Invalid type" + element.type);
    }
  }

  function mouseUp() {
    if (selectedElement) {
      const updatedElement = updateCoordinates(elements[elements.length - 1]);
      console.log(updatedElement, selectedElement);
      setElements((p) =>
        p.map((element) =>
          element.id === updatedElement.id
            ? { ...selectedElement, ...updatedElement }
            : element
        )
      );
    }
    setSelectedElement(null);
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          backgroundColor: "darkblue",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          width: "100%",
        }}
      >
        <button
          onClick={() => {
            dispatch({ type: actions.selection });
          }}
        >
          Selection
        </button>
        <button
          onClick={() => {
            dispatch({ type: actions.drawing, shape: shapes.line });
          }}
        >
          Line
        </button>
        <button
          onClick={() => {
            dispatch({ type: actions.drawing, shape: shapes.rectangle });
          }}
        >
          Rectange
        </button>
      </div>
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ backgroundColor: "lightblue" }}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
      ></canvas>
    </>
  );
}

export default App;
