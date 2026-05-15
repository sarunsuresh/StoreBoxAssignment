import { useCallback, useState } from "react";
import type { NodeId, NodeType, PendingNode, TreeNode } from "../types/tree";
import {
  addNode,
  createFile,
  createFolder,
  deleteNode,
  renameNode,
  toggleFolder,
} from "../utils/tree";

// Seed data so first-time visitors see a useful structure instead of an
// empty pane. Mirrors the screenshot in the assignment.
const initialTree: TreeNode[] = [
  createFolder("src", [
    createFolder("components", [
      createFile("Button.tsx"),
      createFile("Tree.tsx"),
      createFile("TreeNode.tsx"),
    ]),
    createFile("App.tsx"),
    createFile("main.tsx"),
    createFile("index.css"),
  ]),
  createFolder("public", []),
  createFile("package.json"),
  createFile("README.md"),
];

export interface FileTreeApi {
  tree: TreeNode[];
  pending: PendingNode | null;
  // mutations
  beginCreate: (parentId: NodeId | null, type: NodeType) => void;
  cancelCreate: () => void;
  commitCreate: (name: string) => void;
  rename: (id: NodeId, name: string) => void;
  remove: (id: NodeId) => void;
  toggle: (id: NodeId) => void;
}

export function useFileTree(): FileTreeApi {
  const [tree, setTree] = useState<TreeNode[]>(initialTree);
  const [pending, setPending] = useState<PendingNode | null>(null);

  const beginCreate = useCallback(
    (parentId: NodeId | null, type: NodeType) => {
      // If creating inside a folder, ensure it's expanded so the input is
      // visible — otherwise the user clicks "+ New File" and sees nothing.
      if (parentId !== null) {
        setTree((t) =>
          // Force-open by toggling only if currently closed.
          // We do a light pass: walk and open the target folder.
          openFolder(t, parentId),
        );
      }
      setPending({ parentId, type });
    },
    [],
  );

  const cancelCreate = useCallback(() => setPending(null), []);

  const commitCreate = useCallback(
    (name: string) => {
      if (!pending) return;
      setTree((t) => addNode(t, pending.parentId, pending.type, name));
      setPending(null);
    },
    [pending],
  );

  const rename = useCallback((id: NodeId, name: string) => {
    setTree((t) => renameNode(t, id, name));
  }, []);

  const remove = useCallback((id: NodeId) => {
    setTree((t) => deleteNode(t, id));
  }, []);

  const toggle = useCallback((id: NodeId) => {
    setTree((t) => toggleFolder(t, id));
  }, []);

  return {
    tree,
    pending,
    beginCreate,
    cancelCreate,
    commitCreate,
    rename,
    remove,
    toggle,
  };
}

// Helper: ensure a folder is open. Used when starting a create-in-folder.
function openFolder(tree: TreeNode[], id: NodeId): TreeNode[] {
  let changed = false;
  const walk = (nodes: TreeNode[]): TreeNode[] =>
    nodes.map((n) => {
      if (n.type !== "folder") return n;
      if (n.id === id && !n.isOpen) {
        changed = true;
        return { ...n, isOpen: true };
      }
      return { ...n, children: walk(n.children) };
    });
  const next = walk(tree);
  return changed ? next : tree;
}
