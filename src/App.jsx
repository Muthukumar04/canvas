import { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs";

import "./App.css";

const generator = rough.generator();

const shapes = {
  LINE: "LINE",
  RECTANGLE: "RECTANGLE",
};

function createElement({ x1, y1, x2, y2, type }) {
  let element = null;
  switch (type) {
    case shapes.LINE: {
      element = generator.line(x1, y1, x2, y2);
      break;
    }
    case shapes.RECTANGLE: {
      element = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      break;
    }

    default:
      throw new Error("Invalid shape type");
  }
  return { x1, y1, x2, y2, element };
}

function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState([]);
  const [shape, setShape] = useState(shapes.LINE);

  useLayoutEffect(() => {
    const canvas = document.querySelector("canvas");
    const canvasCtx = canvas.getContext("2d");
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({ element }) => {
      roughCanvas.draw(element);
    });
  }, [elements]);

  function onMouseDownHandler(event) {
    setIsDrawing(true);
    const newElement = createElement({
      x1: event.clientX,
      y1: event.clientY,
      x2: event.clientX,
      y2: event.clientY,
      type: shape,
    });
    setElements((p) => [...p, newElement]);
  }

  function onMouseMoveHandler(event) {
    if (!isDrawing) return;
    const index = elements.length - 1;
    const currentElement = elements[index];
    const element = createElement({
      x1: currentElement.x1,
      y1: currentElement.y1,
      x2: event.clientX,
      y2: event.clientY,
      type: shape,
    });
    const elementsCopy = [...elements];
    elementsCopy[index] = element;
    setElements(elementsCopy);
  }

  function onMouseUpHandler(event) {
    setIsDrawing(false);
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
        {Object.entries(shapes).map(([key, value]) => (
          <button key={value} onClick={() => setShape(value)}>
            {value}
          </button>
        ))}
        <p style={{ marginInline: "auto 50px", color: "white" }}>
          Drawing {shape}
        </p>
      </div>
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ backgroundColor: "lightblue" }}
        onMouseDown={onMouseDownHandler}
        onMouseMove={onMouseMoveHandler}
        onMouseUp={onMouseUpHandler}
      ></canvas>
    </>
  );
}

export default App;
