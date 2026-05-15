import { useState } from "react";
import type { NodeId, NodeType, PendingNode, TreeNode as TNode } from "../types/tree";
import {
  hasDuplicateName,
  isNameValid,
  sortNodes,
} from "../utils/tree";
import { ChevronRightIcon, FileIcon, FolderIcon } from "./icons";
import { NameInput } from "./NameInput";

interface TreeNodeProps {
  node: TNode;
  depth: number;
  siblings: TNode[]; // for duplicate-name validation
  pending: PendingNode | null;
  onToggle: (id: NodeId) => void;
  onRename: (id: NodeId, name: string) => void;
  onDelete: (id: NodeId) => void;
  onBeginCreate: (parentId: NodeId | null, type: NodeType) => void;
  onCommitCreate: (name: string) => void;
  onCancelCreate: () => void;
}

/**
 * One row in the tree.
 *
 * Local state held here (and intentionally NOT lifted):
 *   - `isEditing`: this row is in rename mode
 * Everything else flows down from the hook.
 *
 * If the node is a folder and open, we recurse into its children.
 * `PendingCreateRow` is rendered as a child when the user is creating
 * inside this folder.
 */
export function TreeNode({
  node,
  depth,
  siblings,
  pending,
  onToggle,
  onRename,
  onDelete,
  onBeginCreate,
  onCommitCreate,
  onCancelCreate,
}: TreeNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isFolder = node.type === "folder";

  // Indentation per depth level. We use inline padding so the hover row
  // still spans the full width (you can't do that cleanly with margin).
  const indentPx = depth * 14 + 8;

  // Validation for renames: non-empty, valid chars, no sibling collision.
  const validateRename = (name: string): string | null => {
    if (!isNameValid(name)) return "Invalid name";
    if (name === node.name) return null; // unchanged is fine
    if (hasDuplicateName(siblings, name, node.id))
      return "A file or folder with this name already exists";
    return null;
  };

  const handleRowClick = () => {
    if (isEditing) return;
    if (isFolder) onToggle(node.id);
  };

  return (
    <li className="select-none">
      {/* ---- Row ---- */}
      <div
        className="group flex items-center gap-1 py-1 pr-2 text-sm text-vscode-text hover:bg-vscode-hover cursor-pointer transition-colors"
        style={{ paddingLeft: indentPx }}
        onClick={handleRowClick}
      >
        {/* Chevron slot (folders only; files get an empty spacer for alignment) */}
        <span className="flex h-4 w-4 items-center justify-center text-vscode-muted">
          {isFolder ? (
            <ChevronRightIcon
              className={`h-3 w-3 transition-transform ${
                node.isOpen ? "rotate-90" : ""
              }`}
            />
          ) : null}
        </span>

        {/* Type icon */}
        {isFolder ? (
          <FolderIcon className="h-4 w-4 flex-shrink-0" />
        ) : (
          <FileIcon className="h-4 w-4 flex-shrink-0" />
        )}

        {/* Name / inline rename input */}
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <NameInput
              initialValue={node.name}
              validate={validateRename}
              onCommit={(name) => {
                if (name && name !== node.name) onRename(node.id, name);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <span className="truncate">{node.name}</span>
          )}
        </div>

        {/* Hover actions (hidden during edit) */}
        {!isEditing && (
          <div className="ml-auto flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            {isFolder && (
              <>
                <ActionButton
                  label="New File"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBeginCreate(node.id, "file");
                  }}
                />
                <ActionButton
                  label="New Folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBeginCreate(node.id, "folder");
                  }}
                />
              </>
            )}
            <ActionButton
              label="Rename"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            />
            <ActionButton
              label="Delete"
              tone="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
            />
          </div>
        )}
      </div>

      {/* ---- Children + pending create row ---- */}
      {isFolder && node.isOpen && (
        <ul className="m-0 list-none p-0">
          {/* Pending "new node" row inside this folder */}
          {pending && pending.parentId === node.id && (
            <PendingCreateRow
              depth={depth + 1}
              type={pending.type}
              siblings={node.children}
              onCommit={onCommitCreate}
              onCancel={onCancelCreate}
            />
          )}

          {sortNodes(node.children).map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              siblings={node.children}
              pending={pending}
              onToggle={onToggle}
              onRename={onRename}
              onDelete={onDelete}
              onBeginCreate={onBeginCreate}
              onCommitCreate={onCommitCreate}
              onCancelCreate={onCancelCreate}
            />
          ))}

          {/* Empty-folder hint */}
          {node.children.length === 0 &&
            !(pending && pending.parentId === node.id) && (
              <li
                className="py-1 pr-2 text-xs italic text-vscode-muted"
                style={{ paddingLeft: (depth + 1) * 14 + 28 }}
              >
                empty folder
              </li>
            )}
        </ul>
      )}
    </li>
  );
}

// ---------- Hover action button ----------
interface ActionButtonProps {
  label: string;
  tone?: "default" | "danger";
  onClick: (e: React.MouseEvent) => void;
}

function ActionButton({ label, tone = "default", onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs hover:underline ${
        tone === "danger"
          ? "text-red-500 hover:text-red-600"
          : "text-vscode-muted hover:text-vscode-text"
      }`}
    >
      {label}
    </button>
  );
}

// ---------- Pending create row ----------
// Shown as a sibling of a folder's children when the user clicks "+ New File"
// or "+ New Folder". On Enter it becomes a real node; Escape discards it.
interface PendingCreateRowProps {
  depth: number;
  type: NodeType;
  siblings: TNode[];
  onCommit: (name: string) => void;
  onCancel: () => void;
}

function PendingCreateRow({
  depth,
  type,
  siblings,
  onCommit,
  onCancel,
}: PendingCreateRowProps) {
  const indentPx = depth * 14 + 8;

  const validate = (name: string): string | null => {
    if (!isNameValid(name)) return "Invalid name";
    if (hasDuplicateName(siblings, name))
      return "A file or folder with this name already exists";
    return null;
  };

  return (
    <li
      className="flex items-center gap-1 bg-vscode-selected/40 py-1 pr-2 text-sm"
      style={{ paddingLeft: indentPx }}
    >
      <span className="flex h-4 w-4 items-center justify-center" />
      {type === "folder" ? (
        <FolderIcon className="h-4 w-4 flex-shrink-0" />
      ) : (
        <FileIcon className="h-4 w-4 flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <NameInput
          placeholder={type === "folder" ? "folder name" : "file name"}
          validate={validate}
          onCommit={(name) => name && onCommit(name)}
          onCancel={onCancel}
        />
      </div>
    </li>
  );
}
