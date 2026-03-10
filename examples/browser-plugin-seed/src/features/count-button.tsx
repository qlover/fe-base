import { useReducer } from 'react';

export const CountButton = () => {
  const [count, increase] = useReducer((c) => c + 1, 0);

  return (
    <button
      onClick={() => increase()}
      type="button"
      className="fe:flex fe:flex-row fe:items-center fe:px-4 fe:py-2 fe:text-sm fe:rounded-lg fe:transition-all fe:border-none
      fe:shadow-lg fe:hover:shadow-md
      fe:active:scale-105 fe:bg-slate-50 fe:hover:bg-slate-100 fe:text-slate-800 fe:hover:text-slate-900">
      Count:
      <span className="fe:inline-flex fe:items-center fe:justify-center fe:w-8 fe:h-4 fe:ml-2 fe:text-xs fe:font-semibold fe:rounded-full">
        {count}
      </span>
    </button>
  );
};
