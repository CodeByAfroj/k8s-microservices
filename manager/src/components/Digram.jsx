
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Square,
  Circle,
  Minus,
  Pen,
  Type,
  RotateCcw,
  RotateCw,
  Download,
  Trash2,
  Move,
} from "lucide-react";

const COLORS = ["black", "red", "blue", "green", "orange", "purple", "white"];
const COLOR_CLASSES = {
  black: "bg-black",
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  white: "bg-white border border-gray-400",
};

export default function Diagram() {
  const [activeTool, setActiveTool] = useState("select");
  const [selectedColor, setSelectedColor] = useState("black");
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingText, setEditingText] = useState("");

  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentPoints, setCurrentPoints] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const canvasRef = useRef(null);
  const textInputRef = useRef(null);

  // History
  const addToHistory = (newElements) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newElements];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
      setSelectedElementId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
      setSelectedElementId(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(elements, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "drawing.json");
    linkElement.click();
  };

  const handleExportPNG = () => {
    if (!canvasRef.current) return;
    html2canvas(canvasRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.download = "drawing.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  // Mouse events
  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "select") {
      let clicked = null;
      for (let i = elements.length - 1; i >= 0; i--) {
        if (isPointInElement(x, y, elements[i])) {
          clicked = elements[i];
          break;
        }
      }
      if (clicked) {
        setSelectedElementId(clicked.id);
        setIsDragging(true);
        setDragStart({ x, y });
      } else {
        setSelectedElementId(null);
        setIsDragging(false);
      }
      setIsDrawing(false);
    } else {
      setIsDrawing(true);
      setStartPoint({ x, y });
      setCurrentPoints([{ x, y }]);

      if (activeTool === "text") {
        const newText = {
          id: `text-${Date.now()}`,
          type: "text",
          color: selectedColor,
          points: [{ x, y }],
          text: "Edit me",
          fontSize: 16,
        };
        const newElements = [...elements, newText];
        setElements(newElements);
        addToHistory(newElements);
        setSelectedElementId(newText.id);
        setIsEditingText(true);
        setTimeout(() => textInputRef.current?.focus(), 0);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "select" && isDragging && selectedElementId) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      setElements((els) =>
        els.map((el) =>
          el.id === selectedElementId
            ? { ...el, points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
            : el
        )
      );
      setDragStart({ x, y });
    } else if (isDrawing && startPoint) {
      if (activeTool === "pencil") {
        setCurrentPoints([...currentPoints, { x, y }]);
      } else {
        setCurrentPoints([startPoint, { x, y }]);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      addToHistory(elements);
      return;
    }
    if (!isDrawing || !startPoint) return;
    setIsDrawing(false);

    let newElement = null;
    if (activeTool === "pencil") {
      newElement = {
        id: `pencil-${Date.now()}`,
        type: "pencil",
        color: selectedColor,
        points: currentPoints,
      };
    } else if (["rectangle", "circle", "line"].includes(activeTool)) {
      const [start, end] = currentPoints;
      if (!start || !end) return;
      if (activeTool === "rectangle") {
        newElement = {
          id: `rect-${Date.now()}`,
          type: "rectangle",
          color: selectedColor,
          points: [start],
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y),
          filled: false,
        };
      } else if (activeTool === "circle") {
        const radius = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        newElement = {
          id: `circle-${Date.now()}`,
          type: "circle",
          color: selectedColor,
          points: [start],
          radius,
          filled: false,
        };
      } else if (activeTool === "line") {
        newElement = {
          id: `line-${Date.now()}`,
          type: "line",
          color: selectedColor,
          points: [start, end],
        };
      }
    }

    if (newElement) {
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
    }
    setCurrentPoints([]);
  };

  const isPointInElement = (x, y, el) => {
    if (el.type === "rectangle") {
      const p = el.points[0];
      return x >= p.x && x <= p.x + el.width && y >= p.y && y <= p.y + el.height;
    } else if (el.type === "circle") {
      const p = el.points[0];
      const r = el.radius;
      return Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2) <= r;
    } else if (el.type === "line") {
      const [a, b] = el.points;
      const dist = Math.abs((b.y - a.y) * x - (b.x - a.x) * y + b.x * a.y - b.y * a.x) /
        Math.sqrt((b.y - a.y) ** 2 + (b.x - a.x) ** 2);
      return dist <= 5;
    } else if (el.type === "pencil") {
      return el.points.some((p) => Math.hypot(x - p.x, y - p.y) <= 5);
    } else if (el.type === "text") {
      const p = el.points[0];
      return x >= p.x && x <= p.x + 200 && y >= p.y && y <= p.y + 30;
    }
    return false;
  };

  const deleteSelected = () => {
    if (!selectedElementId) return;
    const newEls = elements.filter((el) => el.id !== selectedElementId);
    setElements(newEls);
    addToHistory(newEls);
    setSelectedElementId(null);
  };

  const updateText = () => {
    if (!selectedElementId || !isEditingText) return;
    const newEls = elements.map((el) =>
      el.id === selectedElementId && el.type === "text"
        ? { ...el, text: editingText }
        : el
    );
    setElements(newEls);
    addToHistory(newEls);
    setIsEditingText(false);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Delete") deleteSelected();
      if (e.key === "Escape") {
        setSelectedElementId(null);
        setIsEditingText(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedElementId]);

  const renderElement = (el) => {
    const selected = el.id === selectedElementId;
    const strokeColor = COLOR_CLASSES[el.color];
    if (el.type === "rectangle") {
      const p = el.points[0];
      return (
        <div
          key={el.id}
          className={`absolute border-2 ${selected ? "border-dashed border-blue-500" : strokeColor}`}
          style={{
            left: p.x,
            top: p.y,
            width: el.width,
            height: el.height,
            backgroundColor: el.filled ? el.color : "transparent",
          }}
        />
      );
    } else if (el.type === "circle") {
      const p = el.points[0];
      return (
        <div
          key={el.id}
          className={`absolute rounded-full border-2 ${selected ? "border-dashed border-blue-500" : strokeColor}`}
          style={{
            left: p.x - el.radius,
            top: p.y - el.radius,
            width: el.radius * 2,
            height: el.radius * 2,
            backgroundColor: el.filled ? el.color : "transparent",
          }}
        />
      );
    } else if (el.type === "line") {
      const [a, b] = el.points;
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const angle = Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
      return (
        <div
          key={el.id}
          className={`absolute h-1 ${selected ? "bg-blue-500" : strokeColor}`}
          style={{
            left: a.x,
            top: a.y,
            width: length,
            transformOrigin: "0 0",
            transform: `rotate(${angle}deg)`,
          }}
        />
      );
    } else if (el.type === "pencil") {
      return (
        <svg key={el.id} className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <polyline
            points={el.points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={el.color === "white" ? "black" : el.color}
            strokeWidth="2"
          />
        </svg>
      );
    } else if (el.type === "text") {
      const p = el.points[0];
      return (
        <div
          key={el.id}
          className={`absolute ${selected ? "outline outline-2 outline-blue-500" : ""}`}
          style={{
            left: p.x,
            top: p.y,
            color: el.color === "white" ? "black" : el.color,
            fontSize: el.fontSize,
            minWidth: 100,
            minHeight: 20,
          }}
        >
          {el.text}
        </div>
      );
    }
  };

  const renderTempElement = () => {
    if (!isDrawing || currentPoints.length < 1) return null;
    const [start] = currentPoints;
    const end = currentPoints[currentPoints.length - 1];
    const stroke = COLOR_CLASSES[selectedColor];

    if (activeTool === "rectangle") {
      const left = Math.min(start.x, end.x);
      const top = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      return (
        <div
          className={`absolute border-2 ${stroke}`}
          style={{ left, top, width, height, backgroundColor: "transparent" }}
        />
      );
    } else if (activeTool === "circle") {
      const radius = Math.hypot(end.x - start.x, end.y - start.y);
      return (
        <div
          className={`absolute border-2 rounded-full ${stroke}`}
          style={{ left: start.x - radius, top: start.y - radius, width: radius * 2, height: radius * 2 }}
        />
      );
    } else if (activeTool === "line") {
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
      return (
        <div
          className={`absolute h-1 ${stroke}`}
          style={{ left: start.x, top: start.y, width: length, transformOrigin: "0 0", transform: `rotate(${angle}deg)` }}
        />
      );
    } else if (activeTool === "pencil") {
      return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <polyline
            points={currentPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={selectedColor}
            strokeWidth="2"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-screen dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center p-2 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        <div className="flex space-x-1 mr-4">
          <button
            className={`p-2 rounded ${activeTool === "select" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
            onClick={() => setActiveTool("select")}
            title="Select"
          ><Move className="h-4 w-4" /></button>

          <button
            className={`p-2 rounded ${activeTool === "rectangle" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
            onClick={() => setActiveTool("rectangle")}
            title="Rectangle"
          ><Square className="h-4 w-4" /></button>

          <button
            className={`p-2 rounded ${activeTool === "circle" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
            onClick={() => setActiveTool("circle")}
            title="Circle"
          ><Circle className="h-4 w-4" /></button>

          <button
            className={`p-2 rounded ${activeTool === "line" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
            onClick={() => setActiveTool("line")}
            title="Line"
          ><Minus className="h-4 w-4" /></button>

          <button
            className={`p-2 rounded ${activeTool === "pencil" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
            onClick={() => setActiveTool("pencil")}
            title="Pencil"
          ><Pen className="h-4 w-4" /></button>

          <button
            className={`p-2 rounded ${activeTool === "text" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700"}`}
            onClick={() => setActiveTool("text")}
            title="Text"
          ><Type className="h-4 w-4" /></button>
        </div>

        {/* Colors */}
        <div className="flex space-x-1 mr-4">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full ${COLOR_CLASSES[c]} ${selectedColor === c ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
              onClick={() => setSelectedColor(c)}
              title={c}
            />
          ))}
        </div>

        {/* Undo/Redo */}
        <div className="flex space-x-1 mr-4">
          <button onClick={handleUndo} disabled={historyIndex <= 0} title="Undo" className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} title="Redo" className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Export/Delete */}
        <div className="flex space-x-1">
          <button onClick={handleExportJSON} className="p-2 bg-gray-100 dark:bg-gray-700 rounded" title="Export JSON"><Download className="h-4 w-4" /></button>
          {selectedElementId && (
            <button onClick={deleteSelected} className="p-2 bg-gray-100 dark:bg-gray-700 rounded" title="Delete"><Trash2 className="h-4 w-4" /></button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <div
          ref={canvasRef}
          className="w-full h-full bg-white dark:bg-gray-900 relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {elements.map(renderElement)}
          {renderTempElement()}

          {isEditingText && selectedElementId && (
            <input
              ref={textInputRef}
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onBlur={updateText}
              onKeyDown={(e) => e.key === "Enter" && updateText()}
              className="absolute bg-transparent border-none outline-none text-black dark:text-white"
              style={{
                left: elements.find((el) => el.id === selectedElementId).points[0].x,
                top: elements.find((el) => el.id === selectedElementId).points[0].y,
                fontSize: 16,
              }}
            />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-200 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
        <div>
          {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} tool
        </div>
        <div>{elements.length} elements</div>
      </div>
    </div>
  );
}
