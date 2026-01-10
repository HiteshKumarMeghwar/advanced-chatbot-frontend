import { useEffect, useState } from "react";
import { searchMcp } from "@/api/mcp_server";

function MCPServerSearch({ query, onSelect }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query?.trim()) return;

    let aborted = false;

    async function runSearch() {
      try {
        setLoading(true);
        const res = await searchMcp(query);
        if (!aborted) {
          setResults(res || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    runSearch();

    return () => {
      aborted = true; // avoids race conditions
    };
  }, [query]);

  return (
    <div className="max-h-96 overflow-auto space-y-2">
      {loading && (
        <p className="text-sm text-muted-foreground px-2">Searching…</p>
        // <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        //     {Array.from({ length: 4 }).map((_, i) => (
        //     <span
        //         key={i}
        //         className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
        //         style={{ animationDelay: `${i * 150}ms` }}
        //     />
        //     ))}
        // </div>
      )}

      {!loading && results.length === 0 && (
        <p className="text-sm text-muted-foreground px-2">
          No MCP servers found
        </p>
      )}

      {results.map((s) => (
        <div
          key={s.name}
          onClick={() => onSelect(s)}
          className="cursor-pointer rounded-md border p-3 hover:bg-muted transition"
        >
          <p className="font-medium">{s.name}</p>
          <p className="text-xs text-muted-foreground">{s.url}</p>
          {s.description && (
            <p className="text-xs mt-1 line-clamp-2">
              {s.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default MCPServerSearch;
