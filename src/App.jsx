import { useEffect, useLayoutEffect, useReducer, useState } from "react";
import rough from "roughjs";

import "./App.css";

const generator = rough.generator();

const actions = {
  drawing: "d",
  selection: "s",
  none: "n",
};
const shapes = {
  line: "l",
  rectangle: "r",
  none: "n",
};

function createElement(x1, y1, x2, y2, type) {
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
  return { x1, y1, x2, y2, element };
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
    if (action.action === actions.drawing && action.shape) {
      const { clientX, clientY } = e;
      const createdElement = createElement(
        clientX,
        clientY,
        clientX,
        clientY,
        action.shape
      );
      setElements((p) => [...p, createdElement]);
      setSelectedElement(createdElement);
    }
  }

  function mouseMove(e) {
    const { clientX, clientY } = e;
    if (action.action === actions.drawing && action.shape && selectedElement) {
      const x2 = clientX,
        y2 = clientY;
      const index = elements.length - 1;
      const currentElement = elements[index];
      const { x1, y1 } = currentElement;
      const createdElement = createElement(x1, y1, x2, y2, action.shape);
      const updatedElements = [...elements];
      updatedElements[index] = createdElement;
      setElements(updatedElements);
    }
  }

  function mouseUp() {
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
            dispatch(actions.selection);
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
