# VS Code-style File Explorer

A small but production-quality file explorer built with React, TypeScript, Vite, and Tailwind CSS. No third-party tree libraries.

## Features

- Create / rename / delete files and folders
- Infinite nesting
- Inline rename (Enter to commit, Escape to cancel)
- Hover actions per row
- Expand / collapse folders (auto-expands when creating inside)
- Duplicate-name and invalid-character validation
- Empty-folder hint
- VS Code-inspired styling

## Run

```bash
npm install
npm run dev
```

## Architecture

```
src/
├── types/tree.ts        # Recursive Node types (discriminated union)
├── utils/tree.ts        # Pure immutable tree helpers (add/rename/delete/toggle)
├── hooks/useFileTree.ts # Tree state + action API
├── components/
│   ├── FileExplorer.tsx # Top-level chrome (titlebar, toolbar)
│   ├── Tree.tsx         # Root list + root-level pending create
│   ├── TreeNode.tsx     # Recursive row component
│   ├── NameInput.tsx    # Reusable inline input for create + rename
│   └── icons.tsx        # Inline SVG icons
└── App.tsx
```

### Data model

```ts
type TreeNode = FileNode | FolderNode;
interface FolderNode {
  id: string;
  name: string;
  type: "folder";
  children: TreeNode[];
  isOpen: boolean;
}
```

A discriminated union — TypeScript narrows on `type` so `node.children` is only accessible when it actually exists.

### Mutations

All tree updates go through one generic recursive `mapTree(nodes, fn)`. Add / rename / delete / toggle are thin wrappers over it. Updates are immutable and structurally shared (unchanged subtrees keep the same reference).

### Pending nodes

Creating a new node is a two-step UX: a `PendingNode` placeholder renders inline with an input. On Enter (with valid name) it becomes a real node; Escape discards it. The pending state is held outside the tree so the tree never contains half-built nodes.
