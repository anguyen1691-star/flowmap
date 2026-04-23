import { useState } from 'react';

const HANDLES = [
  { position: 'top', x: 0.5, y: 0 },
  { position: 'bottom', x: 0.5, y: 1 },
  { position: 'left', x: 0, y: 0.5 },
  { position: 'right', x: 1, y: 0.5 },
];

export default function Node({
  node,
  isSelected,
  isConnectionTarget,
  isConnectionSource,
  isConnecting,
  onSelect,
  onUpdate,
  onDelete,
  onContextMenu,
  onStartConnection,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(node.label);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleLabelChange = (e) => {
    setLabel(e.target.value);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
    if (label !== node.label) {
      onUpdate(node.id, { label });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLabelBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setLabel(node.label);
    }
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
    if (e.button === 0 && !isEditing) {
      onSelect(node.id);
      const startX = e.clientX;
      const startY = e.clientY;
      const startPos = { x: node.x, y: node.y };

      const handleMouseMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const gridSize = 24;
        const newX = Math.round((startPos.x + dx) / gridSize) * gridSize;
        const newY = Math.round((startPos.y + dy) / gridSize) * gridSize;
        onUpdate(node.id, { x: newX, y: newY });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(node.id, e.clientX, e.clientY);
  };

  const handleHandleMouseDown = (e, position) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    onStartConnection({
      sourceNodeId: node.id,
      sourceHandle: position,
      startX: rect.left + rect.width / 2,
      startY: rect.top + rect.height / 2,
    });
  };

  const handleResizeMouseDown = (e, corner) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = node.width;
    const startHeight = node.height;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (corner === 'se') {
        newWidth = Math.max(80, startWidth + deltaX);
        newHeight = Math.max(40, startHeight + deltaY);
      } else if (corner === 'sw') {
        newWidth = Math.max(80, startWidth - deltaX);
        newHeight = Math.max(40, startHeight + deltaY);
      } else if (corner === 'ne') {
        newWidth = Math.max(80, startWidth + deltaX);
        newHeight = Math.max(40, startHeight - deltaY);
      } else if (corner === 'nw') {
        newWidth = Math.max(80, startWidth - deltaX);
        newHeight = Math.max(40, startHeight - deltaY);
      }
      onUpdate(node.id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Show handles when: selected, a connection target, or during any connection drag
  // (so the user can see all possible drop targets on every box)
  const showHandles = isSelected || isConnectionTarget || isConnecting;

  // Outline frame styling
  let outlineClass = '';
  if (isConnectionTarget) {
    outlineClass = 'outline outline-[3px] outline-brand-orange shadow-xl ring-4 ring-brand-orange ring-opacity-30';
  } else if (isSelected) {
    outlineClass = 'outline outline-2 outline-brand-orange shadow-lg';
  }

  return (
    <div
      className={`absolute select-none transition-all ${outlineClass}`}
      data-node-id={node.id}
      style={{
        left: `${node.x}px`,
        top: `${node.isGroup ? node.y - 28 : node.y}px`,
        width: `${node.width}px`,
        height: `${node.isGroup ? node.height + 28 : node.height}px`,
      }}
      onMouseDown={(e) => {
        if (
          e.target.closest('[data-handle-id]') ||
          e.target.closest('[data-resize-handle]')
        ) {
          return;
        }
        handleMouseDown(e);
      }}
      onContextMenu={handleContextMenu}
      onDoubleClick={node.isGroup ? undefined : handleDoubleClick}
    >
      {/* Group label (above the box) */}
      {node.isGroup && (
        <div
          className="absolute left-0 top-0 w-full h-7 flex items-center justify-center px-2"
          style={{ backgroundColor: 'transparent' }}
        >
          {isEditing ? (
            <input
              autoFocus
              type="text"
              value={label}
              onChange={handleLabelChange}
              onBlur={handleLabelBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-0 bg-white bg-opacity-80 rounded border border-brand-orange text-center font-bold"
              style={{
                fontSize: `${Math.max(11, Math.min(16, node.width / 14))}px`,
              }}
            />
          ) : (
            <span
              className="font-bold text-brand-navy truncate cursor-pointer hover:underline"
              onDoubleClick={handleDoubleClick}
              style={{
                fontSize: `${Math.max(11, Math.min(16, node.width / 14))}px`,
              }}
            >
              {node.label}
            </span>
          )}
        </div>
      )}

      {/* Node box */}
      <div
        className={`absolute left-0 w-full flex items-center justify-center rounded-[10px] cursor-move text-center px-2 ${
          node.isGroup ? 'border-2 border-dashed' : ''
        }`}
        style={{
          top: node.isGroup ? '28px' : '0px',
          height: node.isGroup ? `${node.height}px` : '100%',
          backgroundColor: node.isGroup ? 'rgba(38, 104, 103, 0.1)' : node.color,
          borderColor: node.isGroup ? '#266867' : undefined,
        }}
      >
        {!node.isGroup && (
          <>
            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={label}
                onChange={handleLabelChange}
                onBlur={handleLabelBlur}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 bg-white bg-opacity-80 rounded border border-brand-orange text-center"
                style={{
                  fontSize: `${Math.max(10, Math.min(16, node.width / 12))}px`,
                }}
              />
            ) : (
              <span
                className="font-medium truncate"
                style={{
                  color: node.color === '#ffffff' ? '#333333' : 'white',
                  fontSize: `${Math.max(10, Math.min(16, node.width / 12))}px`,
                }}
              >
                {node.label}
              </span>
            )}
          </>
        )}
      </div>

      {/* Connection handles - visible when selected, a target, or during any connection drag */}
      {showHandles &&
        HANDLES.map((handle) => {
          const topOffset = node.isGroup ? handle.y * node.height + 28 : handle.y * node.height;
          // Enlarge handle when the node is a connection target so it's easier to drop on
          const size = isConnectionTarget ? 20 : 16;
          const ringClass = isConnectionTarget
            ? 'ring-4 ring-white shadow-lg scale-125'
            : isConnecting
            ? 'ring-2 ring-white shadow-md'
            : 'hover:scale-150';
          return (
            <div
              key={handle.position}
              className={`absolute rounded-full bg-brand-orange cursor-crosshair transition-all z-50 ${ringClass}`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${handle.x * node.width - size / 2}px`,
                top: `${topOffset - size / 2}px`,
                pointerEvents: 'auto',
              }}
              title={`Drag to connect (${handle.position})`}
              data-handle-id={`${node.id}-${handle.position}`}
              data-node-id={node.id}
              data-handle-position={handle.position}
              onMouseDown={(e) => handleHandleMouseDown(e, handle.position)}
            />
          );
        })}

      {/* Resize handles - only when selected and not during a connection drag */}
      {isSelected && !isConnecting && (
        <>
          <div
            className="absolute w-3 h-3 bg-brand-orange rounded-full cursor-nwse-resize"
            data-resize-handle="nw"
            style={{
              left: '-6px',
              top: node.isGroup ? 'calc(28px - 6px)' : '-6px',
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            title="Drag to resize"
          />
          <div
            className="absolute w-3 h-3 bg-brand-orange rounded-full cursor-nesw-resize"
            data-resize-handle="ne"
            style={{
              right: '-6px',
              top: node.isGroup ? 'calc(28px - 6px)' : '-6px',
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            title="Drag to resize"
          />
          <div
            className="absolute w-3 h-3 bg-brand-orange rounded-full cursor-nesw-resize"
            data-resize-handle="sw"
            style={{ left: '-6px', bottom: '-6px' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            title="Drag to resize"
          />
          <div
            className="absolute w-3 h-3 bg-brand-orange rounded-full cursor-nwse-resize"
            data-resize-handle="se"
            style={{ right: '-6px', bottom: '-6px' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            title="Drag to resize"
          />
        </>
      )}
    </div>
  );
}
