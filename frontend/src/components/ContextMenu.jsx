import { useEffect, useRef } from 'react';

export default function ContextMenu({ x, y, items, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[1000] bg-brand-navy border border-brand-teal rounded-lg shadow-xl overflow-hidden"
      style={{ left: x, top: y, minWidth: '160px' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="border-t border-brand-teal my-1" />
        ) : (
          <button
            key={i}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
              item.danger
                ? 'text-red-400 hover:bg-red-900/30'
                : 'text-white hover:bg-brand-teal'
            } ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => { if (!item.disabled) { item.onClick(); onClose(); } }}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
