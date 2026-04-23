import { useState, useCallback, useRef, useEffect } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import StylePanel from './components/StylePanel';
import AIPanel from './components/AIPanel';
import ContextMenu from './components/ContextMenu';
import { exportPNG, exportPDF } from './utils/export';

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [mode, setMode] = useState('select');
  const [clipboard, setClipboard] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, nodeId }
  const canvasRef = useRef(null);

  const addNode = useCallback((x, y, label = 'New Node', width = 160, height = 52) => {
    const id = Date.now().toString();
    const newNode = {
      id,
      label,
      color: '#1A4645',
      x: Math.round(x / 24) * 24,
      y: Math.round(y / 24) * 24,
      width: Math.max(80, width),
      height: Math.max(40, height),
      rounded: true,
    };
    setNodes(prev => [...prev, newNode]);
    setMode('select');
  }, []);

  const addGroup = useCallback((x, y, label = 'Group', width = 320, height = 240) => {
    const id = `group-${Date.now()}`;
    const newGroup = {
      id,
      label,
      color: '#266867',
      x: Math.round(x / 24) * 24,
      y: Math.round(y / 24) * 24,
      width: Math.max(150, width),
      height: Math.max(120, height),
      rounded: true,
      isGroup: true,
    };
    setNodes(prev => [...prev, newGroup]);
    setMode('select');
  }, []);

  const updateNode = useCallback((id, updates) => {
    setNodes(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)));
  }, []);

  const deleteNode = useCallback((id) => {
    setHistory(prev => [...prev, { nodes, edges }]);
    setFuture([]);
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setSelectedNode(prev => (prev === id ? null : prev));
  }, [nodes, edges]);

  const addEdge = useCallback((source, target, sourceHandle, targetHandle) => {
    const id = `e${Date.now()}`;
    setHistory(prev => [...prev, { nodes, edges }]);
    setFuture([]);
    setEdges(prev => [...prev, { id, source, target, sourceHandle, targetHandle, label: '' }]);
  }, [nodes, edges]);

  const deleteEdge = useCallback((id) => {
    setEdges(prev => prev.filter(e => e.id !== id));
  }, []);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setFuture(f => [{ nodes, edges }, ...f]);
      setNodes(last.nodes);
      setEdges(last.edges);
      return prev.slice(0, -1);
    });
  }, [nodes, edges]);

  const redo = useCallback(() => {
    setFuture(prev => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setHistory(h => [...h, { nodes, edges }]);
      setNodes(next.nodes);
      setEdges(next.edges);
      return prev.slice(1);
    });
  }, [nodes, edges]);

  // Delete selected node with Delete or Backspace key (skip when typing in an input)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (selectedNode) deleteNode(selectedNode);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, deleteNode]);

  // Copy the selected node to clipboard
  const copyNode = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) setClipboard(node);
  }, [nodes]);

  // Paste clipboard node offset by 24px
  const pasteNode = useCallback(() => {
    if (!clipboard) return;
    const id = clipboard.isGroup ? `group-${Date.now()}` : Date.now().toString();
    const pasted = {
      ...clipboard,
      id,
      x: clipboard.x + 24,
      y: clipboard.y + 24,
      label: `${clipboard.label} (copy)`,
    };
    setNodes(prev => [...prev, pasted]);
    setSelectedNode(id);
  }, [clipboard]);

  const handleContextMenu = useCallback((nodeId, x, y) => {
    setSelectedNode(nodeId);
    setContextMenu({ x, y, nodeId });
  }, []);

  const handleDiagramUpdate = useCallback((newDiagram) => {
    if (newDiagram && newDiagram.nodes) {
      setHistory(prev => [...prev, { nodes, edges }]);
      setNodes(newDiagram.nodes);
      if (newDiagram.edges) setEdges(newDiagram.edges);
    }
  }, [nodes, edges]);

  const contextMenuItems = contextMenu
    ? [
        {
          icon: '⎘',
          label: 'Copy',
          onClick: () => copyNode(contextMenu.nodeId),
        },
        {
          icon: '⎙',
          label: 'Paste',
          disabled: !clipboard,
          onClick: pasteNode,
        },
        { separator: true },
        {
          icon: '✕',
          label: 'Delete',
          danger: true,
          onClick: () => deleteNode(contextMenu.nodeId),
        },
      ]
    : [];

  const currentDiagram = { nodes, edges };

  return (
    <div className="flex flex-col w-full h-screen bg-brand-light-bg">
      <Toolbar
        mode={mode}
        onAddBox={() => setMode('addBox')}
        onAddGroup={() => setMode('addGroup')}
        onUndo={undo}
        onExportPNG={() => exportPNG(canvasRef, 'flowmap.png')}
        onExportPDF={() => exportPDF(canvasRef, 'flowmap.pdf')}
      />

      <div className="flex flex-1 relative overflow-hidden">
        <Canvas
          ref={canvasRef}
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          onAddNode={addNode}
          onAddGroup={addGroup}
          onUpdateNode={updateNode}
          onDeleteNode={deleteNode}
          onAddEdge={addEdge}
          onDeleteEdge={deleteEdge}
          onContextMenu={handleContextMenu}
          onUndo={undo}
          onRedo={redo}
          canUndo={history.length > 0}
          canRedo={future.length > 0}
          mode={mode}
          onModeChange={setMode}
        />

        {selectedNode && (
          <StylePanel
            node={nodes.find(n => n.id === selectedNode)}
            onUpdateNode={updateNode}
          />
        )}
      </div>

      <AIPanel
        currentDiagram={currentDiagram}
        conversationHistory={conversationHistory}
        onDiagramUpdate={handleDiagramUpdate}
        onConversationUpdate={setConversationHistory}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
