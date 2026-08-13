export type ViewMode = '2d' | '3d';

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-gray-700 bg-gray-900/80 backdrop-blur-sm">
      {(['2d', '3d'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={mode === option}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === option
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
