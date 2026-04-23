const HANDLE_POSITIONS = {
  top: { x: 0.5, y: 0 },
  bottom: { x: 0.5, y: 1 },
  left: { x: 0, y: 0.5 },
  right: { x: 1, y: 0.5 },
};

export function getHandlePoint(node, handle) {
  const pos = HANDLE_POSITIONS[handle] || HANDLE_POSITIONS.right;
  return {
    x: node.x + pos.x * node.width,
    y: node.y + pos.y * node.height,
  };
}

// Outward unit direction from a handle
export function getHandleDirection(handle) {
  switch (handle) {
    case 'top':
      return { x: 0, y: -1 };
    case 'bottom':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
    default:
      return { x: 1, y: 0 };
  }
}

// Smart-default: pick the source and target handles that face each other
// when the user didn't explicitly pick them
export function pickDefaultHandles(source, target) {
  const sCx = source.x + source.width / 2;
  const sCy = source.y + source.height / 2;
  const tCx = target.x + target.width / 2;
  const tCy = target.y + target.height / 2;
  const dx = tCx - sCx;
  const dy = tCy - sCy;
  let sourceHandle;
  let targetHandle;
  if (Math.abs(dx) > Math.abs(dy)) {
    sourceHandle = dx > 0 ? 'right' : 'left';
    targetHandle = dx > 0 ? 'left' : 'right';
  } else {
    sourceHandle = dy > 0 ? 'bottom' : 'top';
    targetHandle = dy > 0 ? 'top' : 'bottom';
  }
  return { sourceHandle, targetHandle };
}

export function calculateEdgePath(source, target, sourceHandle, targetHandle) {
  let sH = sourceHandle;
  let tH = targetHandle;
  if (!sH || !tH) {
    const picked = pickDefaultHandles(source, target);
    sH = sH || picked.sourceHandle;
    tH = tH || picked.targetHandle;
  }

  const s = getHandlePoint(source, sH);
  const t = getHandlePoint(target, tH);
  const sDir = getHandleDirection(sH);
  const tDir = getHandleDirection(tH);

  const dist = Math.hypot(t.x - s.x, t.y - s.y);
  const offset = Math.max(40, Math.min(dist / 2, 140));

  // Cubic bezier with control points extending from each handle along its outward direction
  const c1x = s.x + sDir.x * offset;
  const c1y = s.y + sDir.y * offset;
  const c2x = t.x + tDir.x * offset;
  const c2y = t.y + tDir.y * offset;

  return `M${s.x} ${s.y} C${c1x} ${c1y}, ${c2x} ${c2y}, ${t.x} ${t.y}`;
}
