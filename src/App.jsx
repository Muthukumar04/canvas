import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import rough from "roughjs";

import "./App.css";

const generator = rough.generator();

const actions = {
  drawing: "drawing",
  selection: "selection",
  resizing: "resizing",
  moving: "moving",
  none: "none",
  writing: "writing",
};
const shapes = {
  line: "line",
  rectangle: "rectangle",
  text: "text",
  none: "none",
};
const touchPoints = {
  tl: "tl",
  tr: "tr",
  bl: "bl",
  br: "br",
  inside: "inside",
  online: "online",
  top: "top",
  bottom: "bottom",
};
function createElement(x1, y1, x2, y2, type, id, options) {
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
    case shapes.text: {
      break;
    }
    default:
      throw new Error("Invalid shape type");
  }
  return { x1, y1, x2, y2, element, type, id, options };
}

function distanceBetweenPoints(A, B) {
  return Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2));
}
function getPositionWithinElement(x, y, element) {
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
      const isOnline = ac + cb <= ab + 10 && touchPoints.online;
      const isTop = isNear(x, y, element.x1, element.y1, touchPoints.top);
      const isBottom = isNear(x, y, element.x2, element.y2, touchPoints.bottom);

      return isTop || isBottom || isOnline;
    }
    case shapes.rectangle: {
      const { x1, x2, y1, y2 } = element;
      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const maxX = Math.max(x1, x2);
      const maxY = Math.max(y1, y2);
      const isInside =
        x >= minX && x <= maxX && y >= minY && y <= maxY && touchPoints.inside;
      const tl = isNear(x, y, x1, y1, touchPoints.tl);
      const tr = isNear(x, y, x2, y1, touchPoints.tr);
      const bl = isNear(x, y, x1, y2, touchPoints.bl);
      const br = isNear(x, y, x2, y2, touchPoints.br);
      return tl || tr || bl || br || isInside;
    }
    case shapes.text: {
      const { x1, y1 } = element;
      const width = document
        .querySelector("canvas")
        .getContext("2d")
        .measureText(element.options.value).width;
      const height = 15;
      const x2 = x1 + width;
      const y2 = y1 + height;
      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const maxX = Math.max(x1, x2);
      const maxY = Math.max(y1, y2);
      const isInside =
        x >= minX && x <= maxX && y >= minY && y <= maxY && touchPoints.inside;

      return isInside;
    }
    default:
      throw new Error(`${type} not exist`);
  }
}

function isNear(x, y, x1, y1, name) {
  return Math.abs(x - x1) < 10 && Math.abs(y - y1) < 10 ? name : null;
}

function isOnline(x, y, x1, y1, x2, y2) {}
//returns {x1,x2,y1,y2,element}
function updateElement(x, y, element, mode) {
  let updatedElement = null;
  let { offsetX, offsetY } = element;
  if (actions.moving === mode) {
    switch (element.type) {
      case shapes.line: {
        const { x1, x2, y1, y2 } = element;
        const newX1 = x - offsetX;
        const newY1 = y - offsetY;
        const newX2 = x2 + x - x1 - offsetX;
        const newY2 = y2 + y - y1 - offsetY;
        return {
          element: generator.line(newX1, newY1, newX2, newY2),
          x1: newX1,
          x2: newX2,
          y1: newY1,
          y2: newY2,
        };
      }
      case shapes.rectangle: {
        const width = Math.abs(element.x1 - element.x2);
        const height = Math.abs(element.y1 - element.y2);
        const x1 = x - offsetX,
          y1 = y - offsetY,
          x2 = width + x1,
          y2 = height + y1;
        updatedElement = generator.rectangle(x1, y1, width, height);

        return { element: updatedElement, x1, x2, y1, y2 };
      }
      case shapes.text: {
        let { x1, y1 } = element;
        const width = document
          .querySelector("canvas")
          .getContext("2d")
          .measureText(element.options.value).width;
        const height = 15;
        const x2 = x1 + width;
        const y2 = y1 + height;

        (x1 = x - offsetX), (y1 = y - offsetY), (updatedElement = null);

        return { element: updatedElement, x1, x2, y1, y2 };
      }
      default:
        throw new Error(`Invalid type - ${element.type} for ${mode}`);
    }
  } else if (actions.resizing === mode) {
    switch (element.type) {
      case shapes.line: {
        let { x1, x2, y1, y2 } = element;
        if (touchPoints.top === element.cursorPoint) {
          console.log("Top");
          const newX1 = x;
          const newX2 = x2;
          const newY1 = y;
          const newY2 = y2;
          return {
            element: generator.line(newX1, newY1, newX2, newY2),
            x1: newX1,
            x2: newX2,
            y1: newY1,
            y2: newY2,
          };
        } else if (touchPoints.bottom === element.cursorPoint) {
          console.log("Bottom");
          const newX1 = x1;
          const newX2 = x;
          const newY1 = y1;
          const newY2 = y;
          return {
            element: generator.line(newX1, newY1, newX2, newY2),
            x1: newX1,
            x2: newX2,
            y1: newY1,
            y2: newY2,
          };
        }
      }
      case shapes.rectangle: {
        let { x1, x2, y1, y2 } = element;
        if (touchPoints.br === element.cursorPoint) {
          console.log("BR");
          const newX2 = x;
          const newY2 = y;
          const width = Math.abs(x1 - newX2);
          const height = Math.abs(y1 - newY2);
          let updatedElement = generator.rectangle(x1, y1, width, height);

          return { element: updatedElement, x1, x2: newX2, y1, y2: newY2 };
        } else if (touchPoints.bl === element.cursorPoint) {
          console.log("BL");
          const newX1 = x;
          const newX2 = x2;
          const newY1 = y1;
          const newY2 = y;
          const width = Math.abs(newX1 - newX2);
          const height = Math.abs(newY1 - newY2);
          let updatedElement = generator.rectangle(newX1, newY1, width, height);

          return {
            element: updatedElement,
            x1: newX1,
            x2: newX2,
            y1: newY1,
            y2: newY2,
          };
        } else if (touchPoints.tr === element.cursorPoint) {
          console.log("TR");
          const newX1 = x1;
          const newX2 = x;
          const newY1 = y;
          const newY2 = y2;
          const width = Math.abs(newX1 - newX2);
          const height = Math.abs(newY1 - newY2);
          let updatedElement = generator.rectangle(newX1, newY1, width, height);

          return {
            element: updatedElement,
            x1: newX1,
            x2: newX2,
            y1: newY1,
            y2: newY2,
          };
        } else if (touchPoints.tl === element.cursorPoint) {
          console.log("TR");
          const newX1 = x;
          const newX2 = x2;
          const newY1 = y;
          const newY2 = y2;
          const width = Math.abs(newX1 - newX2);
          const height = Math.abs(newY1 - newY2);
          let updatedElement = generator.rectangle(newX1, newY1, width, height);

          return {
            element: updatedElement,
            x1: newX1,
            x2: newX2,
            y1: newY1,
            y2: newY2,
          };
        }
      }

      default:
        throw new Error("Invalid shape for updating element " + element.type);
    }
  }
}

const defaultAction = { action: actions.none };

function actionReducer(state, action) {
  console.log(action);
  switch (action.type) {
    case actions.drawing: {
      return { action: action.type, shape: action.shape };
    }
    case actions.selection:
      return { action: action.type };
    case actions.moving:
      return { action: action.type };
    case actions.resizing:
      return { action: action.type };
    case actions.writing:
      return { action: action.type };
    default: {
      return { action: actions.none };
    }
  }
}

function App() {
  const [action, dispatch] = useReducer(actionReducer, defaultAction);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showTextArea, setShowTextArea] = useState(false);
  const [textAreaPosition, setTextAreaPosition] = useState(null);

  const textareaRef = useRef();
  let cursorType = "default";
  switch (selectedElement?.cursorPoint) {
    case touchPoints.inside:
    case touchPoints.online: {
      cursorType = "all-scroll";
      break;
    }
    case touchPoints.bl:
    case touchPoints.tr:
    case touchPoints.top: {
      cursorType = "nesw-resize";
      break;
    }
    case touchPoints.br:
    case touchPoints.tl:
    case touchPoints.bottom: {
      cursorType = "nwse-resize";
      break;
    }
    default:
      cursorType = "default";
  }
  useLayoutEffect(() => {
    const canvas = document.querySelector("canvas");
    const canvasCtx = canvas.getContext("2d");
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const roughCanvas = rough.canvas(canvas);
    elements.forEach(({ element, type, options, x1, y1 }) => {
      if (type === shapes.text) {
        canvasCtx.textBaseline = "top";
        canvasCtx.font = "15px Inter";
        canvasCtx.fillText(options.value, x1, y1);
      } else roughCanvas.draw(element);
    });
  }, [elements]);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 10);
  }, [showTextArea]);

  function mouseDown(e) {
    const { clientX, clientY } = e;
    if (action.action === actions.selection) {
      let cursorPoint = null;
      const selectedElement = elements.find((element) => {
        cursorPoint = getPositionWithinElement(clientX, clientY, element);
        if (cursorPoint) {
          switch (cursorPoint) {
            case touchPoints.inside:
            case touchPoints.online: {
              dispatch({ type: actions.moving });
              break;
            }
            case touchPoints.tl:
            case touchPoints.tr:
            case touchPoints.bl:
            case touchPoints.br:
            case touchPoints.top:
            case touchPoints.bottom: {
              dispatch({ type: actions.resizing });
              break;
            }
            default:
              throw new Error();
          }
        }
        return cursorPoint;
      });

      if (selectedElement) {
        const offsetX = clientX - selectedElement.x1,
          offsetY = clientY - selectedElement.y1;
        setSelectedElement({
          ...selectedElement,
          offsetX,
          offsetY,
          cursorPoint,
        });
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
    } else if (actions.writing === action.action && !showTextArea) {
      setShowTextArea(true);
      setTextAreaPosition({ top: clientY, left: clientX });
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
    } else if (
      (action.action === actions.moving ||
        action.action === actions.resizing) &&
      selectedElement
    ) {
      //moving a element
      let updatedElement = null;
      if (actions.moving === action.action) {
        updatedElement = updateElement(
          clientX,
          clientY,
          selectedElement,
          action.action
        );

        // setSelectedElement(updatedElement);
      }
      //resizing a element
      if (actions.resizing === action.action) {
        updatedElement = updateElement(
          clientX,
          clientY,
          selectedElement,
          action.action
        );
      }
      updatedElement = { ...selectedElement, ...updatedElement };
      setElements((p) =>
        p.map((element) =>
          element.id === updatedElement.id ? updatedElement : element
        )
      );
    }
  }

  function updateCoordinates(element) {
    switch (element.type) {
      case shapes.line:
      case shapes.rectangle: {
        let { x1, x2, y1, y2 } = element;

        if (x1 > x2 || y1 > y2) {
          [x1, x2] = [x2, x1];
          [y1, y2] = [y2, y1];
        }

        return createElement(x1, y1, x2, y2, element.type, element.id);
      }
      case shapes.text:
        return element;
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
    if (action.action === actions.moving || action.action === actions.resizing)
      dispatch({ type: actions.selection });
    setSelectedElement(null);
  }
  function blurHandler(event) {
    const textValue = textareaRef.current.value;
    const createdElement = createElement(
      textAreaPosition.left,
      textAreaPosition.top,
      null,
      null,
      shapes.text,
      elements.length,
      { value: textValue }
    );

    setElements((p) => [...p, createdElement]);

    setShowTextArea(false);
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
        <button
          onClick={() => {
            dispatch({ type: actions.writing });
          }}
        >
          Text
        </button>
      </div>
      {showTextArea && (
        <textarea
          ref={textareaRef}
          onBlur={blurHandler}
          style={{
            position: "fixed",

            margin: 0,
            padding: 0,
            border: 0,
            outline: 0,
            resize: "none",
            overflow: "hidden",
            whiteSpace: "pre",
            background: "transparent",
            ...textAreaPosition,
          }}
        />
      )}
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          backgroundColor: "lightblue",
          cursor: cursorType,
        }}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
      ></canvas>
    </>
  );
}

export default App;
