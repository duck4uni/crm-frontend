"use client";

import { useRef, useCallback } from "react";
import type { UseMarketingAutomationReturn } from "../_hooks/useMarketingAutomation";
import type { AutomationNode } from "../_types";

interface Props {
  hook: UseMarketingAutomationReturn;
}

const NODE_W = 168;
const NODE_H = 72;

const NODE_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  trigger:   { bg: "bg-blue-50",   border: "border-blue-300",   icon: "⚡" },
  condition: { bg: "bg-yellow-50", border: "border-yellow-300", icon: "◇" },
  action:    { bg: "bg-green-50",  border: "border-green-300",  icon: "▶" },
  delay:     { bg: "bg-purple-50", border: "border-purple-300", icon: "⏱" },
  end:       { bg: "bg-gray-50",   border: "border-gray-300",   icon: "⬛" },
};

export function WorkflowCanvas({ hook }: Props) {
  const {
    builderNodes, builderEdges,
    selectedNodeId, setSelectedNodeId,
    updateNodePosition,
    connectingFrom, setConnectingFrom,
    addEdge,
  } = hook;

  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: string; ox: number; oy: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent, node: AutomationNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    draggingRef.current = {
      id: node.id,
      ox: e.clientX - (node.x + rect.left),
      oy: e.clientY - (node.y + rect.top),
    };
    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      const x = ev.clientX - r.left - draggingRef.current.ox;
      const y = ev.clientY - r.top - draggingRef.current.oy;
      updateNodePosition(draggingRef.current.id, Math.max(0, x), Math.max(0, y));
    };
    const onUp = () => {
      draggingRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [setSelectedNodeId, updateNodePosition]);

  const onClickPlus = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom === null) {
      setConnectingFrom(nodeId);
    } else if (connectingFrom !== nodeId) {
      addEdge(connectingFrom, nodeId);
    } else {
      setConnectingFrom(null);
    }
  }, [connectingFrom, setConnectingFrom, addEdge]);

  const onClickNode = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom && connectingFrom !== nodeId) {
      addEdge(connectingFrom, nodeId);
    } else {
      setSelectedNodeId(nodeId);
    }
  }, [connectingFrom, addEdge, setSelectedNodeId]);

  // Compute canvas size
  const maxX = Math.max(800, ...builderNodes.map((n) => n.x + NODE_W + 40));
  const maxY = Math.max(600, ...builderNodes.map((n) => n.y + NODE_H + 100));

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto bg-gray-50 flex-1"
      style={{
        backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        minHeight: "600px",
        cursor: connectingFrom ? "crosshair" : "default",
      }}
      onClick={() => { setSelectedNodeId(null); setConnectingFrom(null); }}
    >
      {/* SVG edges */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={maxX}
        height={maxY}
      >
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>
        {builderEdges.map((edge) => {
          const from = builderNodes.find((n) => n.id === edge.from);
          const to = builderNodes.find((n) => n.id === edge.to);
          if (!from || !to) return null;
          const x1 = from.x + NODE_W / 2;
          const y1 = from.y + NODE_H;
          const x2 = to.x + NODE_W / 2;
          const y2 = to.y;
          const cy = (y1 + y2) / 2;
          const d = `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
          return (
            <g key={edge.id}>
              <path d={d} fill="none" stroke="#9ca3af" strokeWidth={1.5} markerEnd="url(#arrow)" />
              {edge.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={cy}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6b7280"
                  dy={-4}
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {builderNodes.map((node) => {
        const style = NODE_STYLES[node.type] ?? NODE_STYLES.action;
        const isSelected = selectedNodeId === node.id;
        const isConnecting = connectingFrom === node.id;
        return (
          <div
            key={node.id}
            className={`absolute select-none rounded-xl border-2 shadow-sm transition-shadow ${style.bg} ${
              isSelected ? "border-primary-500 shadow-md ring-2 ring-primary-200" :
              isConnecting ? "border-blue-500 ring-2 ring-blue-200" :
              style.border
            }`}
            style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H, cursor: "grab" }}
            onMouseDown={(e) => onMouseDown(e, node)}
            onClick={(e) => onClickNode(e, node.id)}
          >
            <div className="flex items-center gap-2 px-3 h-full">
              <span className="text-lg shrink-0">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{node.label}</p>
                <p className="text-xs text-gray-400 capitalize">{node.type}</p>
              </div>
            </div>
            {/* Connect button (bottom center) */}
            {node.type !== "end" && (
              <button
                className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 transition-colors ${
                  isConnecting
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white border-gray-300 text-gray-500 hover:border-primary-400 hover:text-primary-600"
                }`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => onClickPlus(e, node.id)}
                title={connectingFrom === node.id ? "Huỷ kết nối" : "Thêm kết nối"}
              >
                +
              </button>
            )}
          </div>
        );
      })}

      {/* Empty state */}
      {builderNodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-sm font-medium">Canvas trống</p>
            <p className="text-xs mt-1">Thêm node từ thanh công cụ bên trái</p>
          </div>
        </div>
      )}
    </div>
  );
}
