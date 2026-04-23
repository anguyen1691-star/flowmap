export default function Toolbar({ onAddBox, onAddGroup, onExportPNG, onExportPDF, mode }) {
  return (
    <div className="h-16 bg-brand-navy flex items-center px-6 gap-6 border-b border-brand-teal shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 font-bold text-lg">
        <span className="text-brand-amber">Eastern Region Flow</span>
        <span className="text-brand-orange">Mapping</span>
      </div>

      <div className="h-6 w-px bg-brand-teal" />

      {/* Left Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onAddBox}
          className={`px-4 py-2 rounded transition-colors text-sm font-medium ${
            mode === 'addBox'
              ? 'bg-brand-orange text-white ring-2 ring-brand-amber'
              : 'bg-brand-dark-teal text-white hover:bg-brand-teal'
          }`}
          title="Click to draw boxes (click + drag on canvas)"
        >
          + Box
        </button>
        <button
          onClick={onAddGroup}
          className={`px-4 py-2 rounded transition-colors text-sm font-medium ${
            mode === 'addGroup'
              ? 'bg-brand-orange text-white ring-2 ring-brand-amber'
              : 'bg-brand-dark-teal text-white hover:bg-brand-teal'
          }`}
          title="Click to draw groups (click + drag on canvas)"
        >
          + Group
        </button>
      </div>

      <div className="flex-1" />

      {/* Right Buttons */}
      <div className="flex gap-3 items-center">
        <button
          onClick={onExportPNG}
          className="px-4 py-2 text-brand-orange border-2 border-brand-orange rounded hover:bg-brand-orange hover:text-white transition-colors text-sm font-medium"
        >
          ↓ PNG
        </button>
        <button
          onClick={onExportPDF}
          className="px-4 py-2 text-brand-orange border-2 border-brand-orange rounded hover:bg-brand-orange hover:text-white transition-colors text-sm font-medium"
        >
          ↓ PDF
        </button>
        <div className="w-10 h-10 rounded-full bg-brand-light-orange flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:bg-brand-orange transition-colors">
          A
        </div>
      </div>
    </div>
  );
}
