import type { NodeId, NodeType, PendingNode, TreeNode as TNode } from "../types/tree";
import { hasDuplicateName, isNameValid, sortNodes } from "../utils/tree";
import { FileIcon, FolderIcon } from "./icons";
import { NameInput } from "./NameInput";
import { TreeNode } from "./TreeNode";

interface TreeProps {
  tree: TNode[];
  pending: PendingNode | null;
  onToggle: (id: NodeId) => void;
  onRename: (id: NodeId, name: string) => void;
  onDelete: (id: NodeId) => void;
  onBeginCreate: (parentId: NodeId | null, type: NodeType) => void;
  onCommitCreate: (name: string) => void;
  onCancelCreate: () => void;
}

/**
 * Wraps the recursive TreeNode and adds two things only the root needs:
 *   1. A root-level pending create row (when parentId === null).
 *   2. An empty-state when the tree is completely empty.
 */
export function Tree({
  tree,
  pending,
  onToggle,
  onRename,
  onDelete,
  onBeginCreate,
  onCommitCreate,
  onCancelCreate,
}: TreeProps) {
  const rootPending = pending && pending.parentId === null ? pending : null;

  if (tree.length === 0 && !rootPending) {
    return (
      <div className="px-4 py-8 text-center text-sm text-vscode-muted">
        No files yet. Use{" "}
        <span className="font-medium">+ New File</span> or{" "}
        <span className="font-medium">+ New Folder</span> above to get started.
      </div>
    );
  }

  const validateRoot = (name: string): string | null => {
    if (!isNameValid(name)) return "Invalid name";
    if (hasDuplicateName(tree, name))
      return "A file or folder with this name already exists";
    return null;
  };

  return (
    <ul className="m-0 list-none p-0 py-1">
      {rootPending && (
        <li
          className="flex items-center gap-1 bg-vscode-selected/40 py-1 pr-2 text-sm"
          style={{ paddingLeft: 8 }}
        >
          <span className="flex h-4 w-4 items-center justify-center" />
          {rootPending.type === "folder" ? (
            <FolderIcon className="h-4 w-4 flex-shrink-0" />
          ) : (
            <FileIcon className="h-4 w-4 flex-shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <NameInput
              placeholder={
                rootPending.type === "folder" ? "folder name" : "file name"
              }
              validate={validateRoot}
              onCommit={(name) => name && onCommitCreate(name)}
              onCancel={onCancelCreate}
            />
          </div>
        </li>
      )}

      {sortNodes(tree).map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          siblings={tree}
          pending={pending}
          onToggle={onToggle}
          onRename={onRename}
          onDelete={onDelete}
          onBeginCreate={onBeginCreate}
          onCommitCreate={onCommitCreate}
          onCancelCreate={onCancelCreate}
        />
      ))}
    </ul>
  );
}
