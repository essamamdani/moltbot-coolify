import { useState } from "react";

interface AddAgentModalProps {
  onClose: () => void;
  onCreated?: (agent: { agentId: string; name: string; role: string }) => void;
}

const ROLE_SUGGESTIONS = [
  "coordinator",
  "developer",
  "researcher",
  "designer",
  "devops",
  "qa-tester",
  "writer",
];

const AVATAR_SUGGESTIONS = [
  "🤖",
  "🎯",
  "💻",
  "🔍",
  "🎨",
  "🛠️",
  "🧪",
  "✍️",
  "📊",
  "🚀",
];

export default function AddAgentModal({ onClose, onCreated }: AddAgentModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("🤖");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agentId = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const handleSubmit = async () => {
    if (!name.trim() || !role.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/agents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim(),
          description: description.trim() || undefined,
          avatar,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create agent");
      }

      onCreated?.({
        agentId: data.agentId,
        name: data.name,
        role: data.role,
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Add New Agent
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Avatar selector */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Avatar
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {AVATAR_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-9 h-9 text-lg rounded-lg border-2 transition-colors flex items-center justify-center ${
                    avatar === emoji
                      ? "border-accent bg-accent/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Researcher"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              autoFocus
            />
            {agentId && (
              <p className="text-[10px] text-gray-400 mt-1">
                Agent ID: <span className="font-mono">{agentId}</span>
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. researcher"
              list="role-suggestions"
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            <datalist id="role-suggestions">
              {ROLE_SUGGESTIONS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Description{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`You are ${name || "this agent"}, a specialist in ${role || "..."}. Describe their personality and expertise.`}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !role.trim() || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating..." : "Create Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}
