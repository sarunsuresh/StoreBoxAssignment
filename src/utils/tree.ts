import type { FolderNode, NodeId, NodeType, TreeNode } from "../types/tree";

// ---------- ID generation ----------
// crypto.randomUUID is available in modern browsers. We wrap it so it's
// trivial to swap for a deterministic generator in tests.
export const newId = (): NodeId =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// ---------- Factories ----------
export const createFile = (name: string): TreeNode => ({
  id: newId(),
  name,
  type: "file",
});

export const createFolder = (
  name: string,
  children: TreeNode[] = [],
): TreeNode => ({
  id: newId(),
  name,
  type: "folder",
  children,
  isOpen: true,
});

// ---------- Generic recursive map ----------
// `mapTree` walks the tree and lets the caller transform each node.
// All other operations are expressed in terms of it — DRY and easier to test.
// The transform can return:
//   - the same node (no change),
//   - a new node (replacement),
//   - null (delete this node).
type Transform = (node: TreeNode) => TreeNode | null;

export function mapTree(nodes: TreeNode[], fn: Transform): TreeNode[] {
  const out: TreeNode[] = [];
  for (const node of nodes) {
    const transformed = fn(node);
    if (transformed === null) continue;

    if (transformed.type === "folder") {
      const newChildren = mapTree(transformed.children, fn);
      // Only allocate a new object if children actually changed —
      // avoids unnecessary re-renders.
      out.push(
        newChildren === transformed.children
          ? transformed
          : { ...transformed, children: newChildren },
      );
    } else {
      out.push(transformed);
    }
  }
  return out;
}

// ---------- Operations ----------

/** Add a child to the folder with `parentId`. If parentId is null, add at root. */
export function addNode(
  tree: TreeNode[],
  parentId: NodeId | null,
  type: NodeType,
  name: string,
): TreeNode[] {
  const newNode =
    type === "folder" ? createFolder(name) : createFile(name);

  if (parentId === null) {
    return [...tree, newNode];
  }

  return mapTree(tree, (node) => {
    if (node.id === parentId && node.type === "folder") {
      return {
        ...node,
        isOpen: true, // auto-expand the folder we just added into
        children: [...node.children, newNode],
      };
    }
    return node;
  });
}

/** Rename a node by id. */
export function renameNode(
  tree: TreeNode[],
  id: NodeId,
  name: string,
): TreeNode[] {
  return mapTree(tree, (node) =>
    node.id === id ? { ...node, name } : node,
  );
}

/** Delete a node by id. */
export function deleteNode(tree: TreeNode[], id: NodeId): TreeNode[] {
  return mapTree(tree, (node) => (node.id === id ? null : node));
}

/** Toggle a folder's open/closed state. */
export function toggleFolder(tree: TreeNode[], id: NodeId): TreeNode[] {
  return mapTree(tree, (node) => {
    if (node.id === id && node.type === "folder") {
      return { ...node, isOpen: !node.isOpen };
    }
    return node;
  });
}

// ---------- Sorting (presentation helper, kept pure) ----------
// VS Code sorts folders before files, then alphabetically. We sort on
// render rather than on insert so user actions feel snappy and stable.
export function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

// ---------- Validation ----------
export function isNameValid(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  // Block characters that would be invalid on most filesystems
  return !/[\\/:*?"<>|]/.test(trimmed);
}

/** Is there already a sibling with this name inside `parent`? */
export function hasDuplicateName(
  siblings: TreeNode[],
  name: string,
  ignoreId?: NodeId,
): boolean {
  const target = name.trim().toLowerCase();
  return siblings.some(
    (n) => n.id !== ignoreId && n.name.toLowerCase() === target,
  );
}

/** Look up a folder's children, or null if not found / not a folder. */
export function findFolder(
  tree: TreeNode[],
  id: NodeId | null,
): FolderNode | null {
  if (id === null) return null;
  for (const node of tree) {
    if (node.id === id && node.type === "folder") return node;
    if (node.type === "folder") {
      const found = findFolder(node.children, id);
      if (found) return found;
    }
  }
  return null;
}
