import { useEffect, useRef, useState } from "react";

interface NameInputProps {
  initialValue?: string;
  placeholder?: string;
  /** Called with the trimmed name when user commits (Enter / blur). */
  onCommit: (name: string) => void;
  /** Called when user cancels (Escape). */
  onCancel: () => void;
  /** Optional validator. Return null if valid, or an error message string. */
  validate?: (name: string) => string | null;
}

/**
 * A small controlled input used both for creating new nodes and renaming
 * existing ones. Keeping it in one component means:
 *   - one keyboard contract (Enter / Escape)
 *   - one validation pipeline
 *   - one focus/select behavior
 */
export function NameInput({
  initialValue = "",
  placeholder,
  onCommit,
  onCancel,
  validate,
}: NameInputProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Guard so blur doesn't fire commit again after Escape/Enter already handled it.
  const settledRef = useRef(false);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    // Select the basename so the extension stays put when renaming
    // (matches VS Code's behavior).
    if (initialValue) {
      const dot = initialValue.lastIndexOf(".");
      input.setSelectionRange(0, dot > 0 ? dot : initialValue.length);
    }
  }, [initialValue]);

  const settle = (action: "commit" | "cancel") => {
    if (settledRef.current) return;
    settledRef.current = true;
    if (action === "commit") {
      const trimmed = value.trim();
      const err = validate ? validate(trimmed) : null;
      if (err) {
        // Re-allow further attempts and surface the error.
        settledRef.current = false;
        setError(err);
        return;
      }
      onCommit(trimmed);
    } else {
      onCancel();
    }
  };

  return (
    <div className="flex flex-col">
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            settle("commit");
          } else if (e.key === "Escape") {
            e.preventDefault();
            settle("cancel");
          }
        }}
        onBlur={() => settle("commit")}
        className={`w-full rounded-sm border bg-white px-1.5 py-0.5 text-sm outline-none focus:ring-1 ${
          error
            ? "border-red-400 focus:ring-red-300"
            : "border-vscode-accent focus:ring-vscode-accent/40"
        }`}
      />
      {error && (
        <span className="mt-0.5 text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
