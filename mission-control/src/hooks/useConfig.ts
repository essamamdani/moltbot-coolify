import { useState, useEffect } from "react";

export interface MCConfig {
  gatewayToken: string;
  gatewayPort: number;
  gatewayUrl: string;
  agents: string[];
  model: string;
}

/**
 * Fetches the gateway config from /api/config (served from mc-shared volume).
 * Returns null while loading, or the parsed config.
 */
export function useConfig() {
  const [config, setConfig] = useState<MCConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchConfig() {
      try {
        const res = await fetch("/api/config");
        if (!res.ok) {
          throw new Error(`Config fetch failed: ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setConfig(data);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.warn("[useConfig] Failed to load gateway config:", err.message);
          setError(err.message);
          // In demo/development mode, provide fallback config
          setConfig({
            gatewayToken: "demo-token",
            gatewayPort: 18789,
            gatewayUrl: window.location.origin.replace(":3000", ":18789"),
            agents: ["jarvis", "developer"],
            model: "moonshot/kimi-k2.5",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchConfig();
    return () => { cancelled = true; };
  }, []);

  const gatewayLink = config
    ? `${config.gatewayUrl}?token=${config.gatewayToken}`
    : null;

  return { config, loading, error, gatewayLink };
}
