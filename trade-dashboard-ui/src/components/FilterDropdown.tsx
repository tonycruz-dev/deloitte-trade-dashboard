import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type FilterDropdownOption = {
  label: string;
  value: string;
};

type FilterDropdownProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterDropdownOption[];
};

export default function FilterDropdown({
  label,
  value,
  onChange,
  options,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative z-[180] min-w-[148px] self-start">
      <button
        type="button"
        className="glass-pill flex w-full items-center gap-2.5 pr-3 text-left"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.26em] text-cyan-200/70">
          {label}
        </span>
        <span className="flex-1 truncate text-xs font-medium text-white sm:text-sm">
          {selectedOption?.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-cyan-200/70 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="filter-dropdown-menu absolute bottom-full left-0 right-auto z-[9999] mb-2 min-w-full overflow-hidden rounded-2xl">
          {options.map((option) => {
            const isActive = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className={
                  isActive
                    ? "filter-dropdown-option filter-dropdown-option-active"
                    : "filter-dropdown-option"
                }
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
