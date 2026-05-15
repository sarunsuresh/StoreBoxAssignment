import { useFileTree } from "../hooks/useFileTree";
import { Tree } from "./Tree";

/**
 * The full explorer "window":
 *   - macOS-style title bar (purely decorative, matches the screenshot)
 *   - Toolbar with the two required buttons (+ New File / + New Folder)
 *     for creating at the root
 *   - The scrollable tree pane
 *
 * State lives in the useFileTree hook so this component stays a thin shell.
 */
export function FileExplorer() {
  const {
    tree,
    pending,
    beginCreate,
    cancelCreate,
    commitCreate,
    rename,
    remove,
    toggle,
  } = useFileTree();

  return (
    <div className="mx-auto flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-vscode-border bg-vscode-bg shadow-lg">
      {/* Title bar */}
      <div className="relative flex items-center justify-center border-b border-vscode-border bg-vscode-panel px-3 py-2">
        <div className="absolute left-3 flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <span className="text-sm font-medium text-vscode-text">
          File Explorer
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 border-b border-vscode-border px-3 py-2">
        <button
          type="button"
          onClick={() => beginCreate(null, "file")}
          className="rounded bg-vscode-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800"
        >
          + New File
        </button>
        <button
          type="button"
          onClick={() => beginCreate(null, "folder")}
          className="rounded border border-vscode-border bg-white px-3 py-1.5 text-xs font-medium text-vscode-text shadow-sm transition-colors hover:bg-vscode-hover active:bg-slate-100"
        >
          + New Folder
        </button>
      </div>

      {/* Tree pane */}
      <div className="flex-1 overflow-auto bg-white">
        <Tree
          tree={tree}
          pending={pending}
          onToggle={toggle}
          onRename={rename}
          onDelete={remove}
          onBeginCreate={beginCreate}
          onCommitCreate={commitCreate}
          onCancelCreate={cancelCreate}
        />
      </div>
    </div>
  );
}
