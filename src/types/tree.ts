// A discriminated union: every Node is either a File or a Folder.
// `type` is the discriminator — TS narrows correctly when you check it.
//
// We intentionally do NOT store a `parentId` on nodes. Parent links are
// implicit in the tree shape. This keeps inserts/moves simple and prevents
// the two sources of truth (children array vs parentId) from drifting.

export type NodeId = string;

export interface FileNode {
  id: NodeId;
  name: string;
  type: "file";
}

export interface FolderNode {
  id: NodeId;
  name: string;
  type: "folder";
  children: TreeNode[];
  isOpen: boolean;
}

export type TreeNode = FileNode | FolderNode;

export type NodeType = TreeNode["type"];

// Used when a row is in "create" mode — we render a placeholder input
// in-place before a real node exists. Keeping this separate from TreeNode
// means the tree never holds half-created garbage.
export interface PendingNode {
  parentId: NodeId | null; // null = create at root
  type: NodeType;
}
