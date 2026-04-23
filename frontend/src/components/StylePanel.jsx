const COLORS = [
  '#051821', '#1A4645', '#266867', '#F58800', '#F8BC24',
  '#4F6D8A', '#9EB3C2', '#3B5070', '#DDEAF8', '#F05223',
  '#FDB130', '#ffffff', '#F0F0EC', '#888888', '#333333',
];

export default function StylePanel({ node, onUpdateNode }) {
  if (!node) return null;

  return (
    <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg border border-brand-light-gray p-4 w-64 z-50">
      <h3 className="text-xs font-semibold text-brand-navy mb-3 uppercase tracking-wide">
        Node Color
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onUpdateNode(node.id, { color })}
            className={`w-10 h-10 rounded transition-all border-2 ${
              node.color === color
                ? 'border-brand-orange scale-110'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
