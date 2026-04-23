import { forwardRef, useState, useRef, useEffect } from 'react';
import Node from './Node';
import {
  calculateEdgePath,
  getHandlePoint,
  getHandleDirection,
  pickDefaultHandles,
} from '../utils/edges';

const Canvas = forwardRef(
  (
    {
      nodes,
      edges,
      selectedNode,
      onSelectNode,
      onAddNode,
      onAddGroup,
      onUpdateNode,
      onDeleteNode,
      onAddEdge,
      onDeleteEdge,
      onContextMenu,
      onUndo,
      onRedo,
      canUndo,
      canRedo,
      mode,
      onModeChange,
    },
    ref
  ) => {
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [dragPreview, setDragPreview] = useState(null);
    const [connectionDrag, setConnectionDrag] = useState(null);
    const dragPreviewRef = useRef(null);

    const handleCanvasClick = (e) => {
      if (e.target === ref.current && mode === 'select') {
        onSelectNode(null);
      }
    };

    // Connection drag: starts when user mousedowns on a handle dot.
    // While active, tracks mouse position and highlights the node under the cursor.
    // On release, creates an edge if the mouse is over a different node.
    useEffect(() => {
      if (!connectionDrag) return;

      const handleMouseMove = (e) => {
        const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
        // Highlight the node if the cursor is over any part of it
        const targetNodeEl = elementUnder?.closest('[data-node-id]');
        const hoveredId = targetNodeEl?.getAttribute('data-node-id');
        // Track if hovering specifically on a handle dot
        const targetHandleEl = elementUnder?.closest('[data-handle-id]');
        const hoveredHandle = targetHandleEl?.getAttribute('data-handle-position');

        setConnectionDrag((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            endX: e.clientX,
            endY: e.clientY,
            hoveredNodeId:
              hoveredId && hoveredId !== prev.sourceNodeId ? hoveredId : null,
            hoveredHandle:
              targetHandleEl && hoveredId !== prev.sourceNodeId
                ? hoveredHandle
                : null,
          };
        });
      };

      const handleMouseUp = (e) => {
        const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
        // Only accept the connection if released on a handle dot
        const targetHandleEl = elementUnder?.closest('[data-handle-id]');
        const targetNodeId = targetHandleEl?.getAttribute('data-node-id');
        const targetHandle = targetHandleEl?.getAttribute('data-handle-position');

        if (targetNodeId && targetNodeId !== connectionDrag.sourceNodeId) {
          onAddEdge(
            connectionDrag.sourceNodeId,
            targetNodeId,
            connectionDrag.sourceHandle,
            targetHandle
          );
        }
        setConnectionDrag(null);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [connectionDrag?.sourceNodeId, onAddEdge]);

    const handleStartConnection = (data) => {
      setConnectionDrag({
        sourceNodeId: data.sourceNodeId,
        sourceHandle: data.sourceHandle,
        startX: data.startX,
        startY: data.startY,
        endX: data.startX,
        endY: data.startY,
        hoveredNodeId: null,
      });
    };

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const newZoom = Math.max(0.1, zoom - e.deltaY * 0.001);
        setZoom(newZoom);
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 0 && e.target === ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;
        const canvasX = (startX - rect.left - pan.x) / zoom;
        const canvasY = (startY - rect.top - pan.y) / zoom;

        if (mode === 'addBox' || mode === 'addGroup') {
          const handleMouseMove = (moveEvent) => {
            const currentCanvasX = (moveEvent.clientX - rect.left - pan.x) / zoom;
            const currentCanvasY = (moveEvent.clientY - rect.top - pan.y) / zoom;
            const x = Math.min(canvasX, currentCanvasX);
            const y = Math.min(canvasY, currentCanvasY);
            const width = Math.abs(currentCanvasX - canvasX);
            const height = Math.abs(currentCanvasY - canvasY);
            const preview = { x, y, width, height };
            dragPreviewRef.current = preview;
            setDragPreview(preview);
          };

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            const preview = dragPreviewRef.current;
            if (preview && preview.width > 20 && preview.height > 20) {
              if (mode === 'addBox') {
                onAddNode(preview.x, preview.y, 'New Box', preview.width, preview.height);
              } else if (mode === 'addGroup') {
                onAddGroup(preview.x, preview.y, 'Group', preview.width, preview.height);
              }
            }
            dragPreviewRef.current = null;
            setDragPreview(null);
            onModeChange('select');
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        } else {
          const startPan = { ...pan };
          const handleMouseMove = (moveEvent) => {
            setPan({
              x: startPan.x + (moveEvent.clientX - startX),
              y: startPan.y + (moveEvent.clientY - startY),
            });
          };
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }
      }
    };

    // Convert viewport coordinates to SVG/canvas coordinates
    const toCanvasCoords = (vpX, vpY) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (vpX - rect.left - pan.x) / zoom,
        y: (vpY - rect.top - pan.y) / zoom,
      };
    };

    return (
      <div
        ref={ref}
        className={`flex-1 relative bg-brand-light-bg canvas-dot-grid overflow-hidden ${
          mode === 'addBox' || mode === 'addGroup' ? 'cursor-crosshair' : 'cursor-grab'
        }`}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        style={{
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* SVG for edges */}
        <svg
          className="absolute inset-0 pointer-events-none w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {edges.map((edge) => {
            const source = nodes.find((n) => n.id === edge.source);
            const target = nodes.find((n) => n.id === edge.target);
            if (!source || !target) return null;

            // Back-fill handles for older edges that were created before handle tracking
            let sH = edge.sourceHandle;
            let tH = edge.targetHandle;
            if (!sH || !tH) {
              const picked = pickDefaultHandles(source, target);
              sH = sH || picked.sourceHandle;
              tH = tH || picked.targetHandle;
            }

            const sPoint = getHandlePoint(source, sH);
            const tPoint = getHandlePoint(target, tH);
            const tDir = getHandleDirection(tH);
            // Arrow points INTO the node, opposite to the target handle's outward direction
            const arrowAngle =
              (Math.atan2(-tDir.y, -tDir.x) * 180) / Math.PI;
            const path = calculateEdgePath(source, target, sH, tH);

            return (
              <g key={edge.id}>
                <path
                  d={path}
                  stroke="#051821"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Arrow head with tip at the target dot */}
                <polygon
                  points="-12,-6 0,0 -12,6"
                  fill="#051821"
                  transform={`translate(${tPoint.x}, ${tPoint.y}) rotate(${arrowAngle})`}
                />
                {edge.label && (
                  <text
                    x={(sPoint.x + tPoint.x) / 2}
                    y={(sPoint.y + tPoint.y) / 2 - 6}
                    className="text-xs pointer-events-auto cursor-pointer"
                    textAnchor="middle"
                    fill="#051821"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Connection drag preview line with arrow head */}
          {connectionDrag && (() => {
            const start = toCanvasCoords(connectionDrag.startX, connectionDrag.startY);
            const end = toCanvasCoords(connectionDrag.endX, connectionDrag.endY);
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const onHandle = !!connectionDrag.hoveredHandle;
            const color = onHandle ? '#10B981' : '#F58800';
            return (
              <>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={color}
                  strokeWidth="3"
                  strokeDasharray="8,4"
                  pointerEvents="none"
                  opacity="0.9"
                />
                <polygon
                  points="0,-7 14,0 0,7"
                  fill={color}
                  opacity="0.95"
                  transform={`translate(${end.x}, ${end.y}) rotate(${angle})`}
                />
              </>
            );
          })()}
        </svg>

        {/* Drag preview for new boxes */}
        {dragPreview && (
          <div
            style={{
              position: 'absolute',
              left: `${dragPreview.x * zoom + pan.x}px`,
              top: `${dragPreview.y * zoom + pan.y}px`,
              width: `${dragPreview.width * zoom}px`,
              height: `${dragPreview.height * zoom}px`,
              border: '2px dashed #F58800',
              backgroundColor: 'rgba(245, 136, 0, 0.1)',
              borderRadius: '10px',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Nodes */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {nodes.map((node) => (
            <Node
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              isConnectionTarget={connectionDrag?.hoveredNodeId === node.id}
              isConnectionSource={connectionDrag?.sourceNodeId === node.id}
              isConnecting={!!connectionDrag}
              onSelect={onSelectNode}
              onUpdate={onUpdateNode}
              onDelete={onDeleteNode}
              onContextMenu={onContextMenu}
              onStartConnection={handleStartConnection}
              edges={edges}
            />
          ))}
        </div>

        {/* Zoom + Undo/Redo controls — excluded from PNG/PDF export */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2" data-export-exclude="true">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-10 h-10 bg-brand-navy text-white rounded flex items-center justify-center hover:bg-brand-teal transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-lg"
            title="Undo"
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-10 h-10 bg-brand-navy text-white rounded flex items-center justify-center hover:bg-brand-teal transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-lg"
            title="Redo"
          >
            ↷
          </button>
          <div className="h-px bg-brand-teal opacity-40" />
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.2))}
            className="w-10 h-10 bg-brand-navy text-white rounded flex items-center justify-center hover:bg-brand-teal transition-colors"
          >
            +
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="w-10 h-10 bg-brand-navy text-white rounded flex items-center justify-center hover:bg-brand-teal transition-colors text-xs font-bold"
          >
            fit
          </button>
          <button
            onClick={() => setZoom(Math.max(0.1, zoom - 0.2))}
            className="w-10 h-10 bg-brand-navy text-white rounded flex items-center justify-center hover:bg-brand-teal transition-colors"
          >
            −
          </button>
        </div>
      </div>
    );
  }
);

Canvas.displayName = 'Canvas';

export default Canvas;
