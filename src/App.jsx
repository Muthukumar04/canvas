import { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs";

import "./App.css";

const generator = rough.generator();

const properties = {
  FILL: {
    label: "fill",
    values: ["green", "red", "blue"],
  },
  STROKE: {
    label: "stroke",
    values: ["green", "red", "blue"],
  },
};
const shapes = {
  LINE: "LINE",
  RECTANGLE: "RECTANGLE",
  CIRCLE: "CIRCLE",
};
const defaultOptions = {};
function createElement({ startX, startY, endX, endY, type, options }) {
  let element = null;
  const calculatedOptions = options ? options : defaultOptions;
  switch (type) {
    case shapes.LINE: {
      element = generator.line(startX, startY, endX, endY, calculatedOptions);
      break;
    }
    case shapes.RECTANGLE: {
      element = generator.rectangle(
        startX,
        startY,
        endX - startX,
        endY - startY,
        calculatedOptions
      );
      break;
    }
    case shapes.CIRCLE: {
      let diameter =
        Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2)) * 2;
      element = generator.circle(startX, startY, diameter, calculatedOptions);
      break;
    }
    default:
      throw new Error("Invalid shape type");
  }
  return { startX, startY, endX, endY, element };
}

function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState([]);
  const [options, setOptions] = useState(defaultOptions);
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
      startX: event.clientX,
      startY: event.clientY,
      endX: event.clientX,
      endY: event.clientY,
      type: shape,
      options,
    });
    setElements((p) => [...p, newElement]);
  }

  function onMouseMoveHandler(event) {
    if (!isDrawing) return;
    const index = elements.length - 1;
    const currnet = elements[index];
    const element = createElement({
      startX: currnet.startX,
      startY: currnet.startY,
      endX: event.clientX,
      endY: event.clientY,
      type: shape,
      options,
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
        {Object.entries(properties).map(([key, value]) => {
          const dropDown = (
            <span key={value.label}>
              <label style={{ color: "white" }} htmlFor={value.label}>
                {value.label}
              </label>
              <select
                id={value.label}
                onChange={(e) =>
                  setOptions((p) => ({ ...p, [value.label]: e.target.value }))
                }
              >
                {value.values.map((color) => (
                  <option key={color}>{color}</option>
                ))}
              </select>
            </span>
          );
          return dropDown;
        })}
        <p style={{ marginInline: "auto 50px", color: "white" }}>
          Drawing {shape} -
          <>
            {Object.entries(options).map(([key, value], index) => {
              return (
                <span key={key}>{`${key.toUpperCase()} ${value} ${
                  Object.entries(options).length - 1 === index ? "" : "-"
                }`}</span>
              );
            })}
          </>
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
