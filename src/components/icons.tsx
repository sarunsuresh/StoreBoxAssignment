// Inline SVG icons. We keep them local rather than pulling in a library
// because we need only three icons and want zero extra dependencies.

interface IconProps {
  className?: string;
}

export function ChevronRightIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 4l4 4-4 4V4z" />
    </svg>
  );
}

export function FolderIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3.379a1.5 1.5 0 0 1 1.06.44L8.5 3.5H13a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 13 13.5H3A1.5 1.5 0 0 1 1.5 12v-8.5z"
        fill="#5b9bd5"
        stroke="#3a7ab8"
        strokeWidth="0.5"
      />
    </svg>
  );
}

export function FileIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 1.5h6L13 5.5v9A1.5 1.5 0 0 1 11.5 16h-8.5A1.5 1.5 0 0 1 1.5 14.5v-12A1.5 1.5 0 0 1 3 1z"
        fill="#ffffff"
        stroke="#9ca3af"
        strokeWidth="0.8"
      />
      <path
        d="M9 1.5v3.5a1 1 0 0 0 1 1h3"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="0.8"
      />
    </svg>
  );
}
