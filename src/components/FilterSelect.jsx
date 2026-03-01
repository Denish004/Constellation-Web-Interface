import React from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown } from 'lucide-react';

export default function FilterSelect({ value, options, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [rect, setRect] = React.useState(null);
  const btnRef = React.useRef(null);

  const handleOpen = () => {
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen(o => !o);
  };

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-1 bg-slate-800 border border-slate-700 hover:border-slate-500 rounded px-2 py-0.5 text-[10px] text-slate-300 focus:outline-none min-w-[80px] justify-between"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
      </button>
      {open && rect && ReactDOM.createPortal(
        <div
          style={{ position: 'fixed', top: rect.top - 4, left: rect.left, transform: 'translateY(-100%)', zIndex: 9999 }}
          className="bg-slate-900 border border-slate-700 rounded shadow-xl min-w-[160px] py-1"
        >
          {options.map(opt => (
            <button
              key={opt}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-1 text-[10px] hover:bg-slate-700 transition-colors ${
                opt === value ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-slate-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
