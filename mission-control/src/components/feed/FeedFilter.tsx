import type { FeedFilter as FeedFilterType } from "../../types";

interface FeedFilterProps {
  active: FeedFilterType;
  onChange: (filter: FeedFilterType) => void;
}

const FILTERS: { key: FeedFilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tasks", label: "Tasks" },
  { key: "comments", label: "Comments" },
  { key: "decisions", label: "Decisions" },
];

export default function FeedFilter({ active, onChange }: FeedFilterProps) {
  return (
    <div className="flex gap-1">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            active === key
              ? "bg-accent text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
