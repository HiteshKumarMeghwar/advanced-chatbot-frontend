"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

import {
  fetchMemoryMetrics,
  fetchMemorySettings,
  fetchSemanticMemories,
  fetchEpisodicRecentMemories,
  fetchProceduralMemories,
} from "@/api/user_memory";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SettingsPage() {
  const [metrics, setMetrics] = useState({});
  const [settings, setSettings] = useState({});

  const [episodic, setEpisodic] = useState([]);
  const [semantic, setSemantic] = useState([]);
  const [procedural, setProcedural] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchMemoryMetrics(),
      fetchMemorySettings(),
      fetchEpisodicRecentMemories(),
      fetchSemanticMemories(),
      fetchProceduralMemories(),
    ]).then(([m, s, ep, sem, pro]) => {
      setMetrics(m);
      setSettings(s);
      setEpisodic(ep);
      setSemantic(sem);
      setProcedural(pro);
    });
  }, []);

  async function toggle(field) {
    const res = await fetch(`${API_URL}/memory/toggle/${field}`, {
      method: "PATCH",
      credentials: "include",
    });
    const data = await res.json();
    setSettings((prev) => ({ ...prev, [field]: data.enabled }));
  }

  return (
    <>
      <Header protectedRoute />
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <Tabs defaultValue="pii">
          <TabsList>
            <TabsTrigger value="pii">PII & Metrics</TabsTrigger>
            <TabsTrigger value="memory">User Memory</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          {/* ---------------- PII ---------------- */}
          <TabsContent value="pii" className="space-y-4">
          {/* ------- row 1: high-level counters ------- */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Extractions Total" value={metrics.extraction_total ?? 0} />
            <MetricCard title="Extraction Failures" value={metrics.extraction_failures ?? 0} />
            <MetricCard title="Semantic Saved (plain)" value={metrics.semantic_saved?.plaintext ?? 0} />
            <MetricCard title="Semantic Saved (encrypted)" value={metrics.semantic_saved?.encrypted ?? 0} />
            <MetricCard title="Semantic Versioned" value={metrics.semantic_versioned ?? 0} />
          </div>

          {/* ------- row 2: PII breakdown ------- */}
          <Card>
            <CardHeader>
              <CardTitle>PII Encrypted Counters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-3">
              {metrics.pii_encrypted
                ? Object.entries(metrics.pii_encrypted).map(([k, v]) => (
                    <div key={k} className="flex justify-between border rounded p-2">
                      <span className="capitalize">{k.replace(/_/g, " ")}</span>
                      <span className="font-semibold">{v ?? 0}</span>
                    </div>
                  ))
                : <span className="text-muted-foreground">No PII metrics yet</span>}
            </CardContent>
          </Card>
        </TabsContent>

          {/* ---------------- MEMORY ---------------- */}
          <TabsContent value="memory" className="space-y-6">
            {/* Toggles */}
            <Card>
              <CardHeader>
                <CardTitle>Memory Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Toggle label="Episodic Memory" value={settings.allow_episodic} on={() => toggle("allow_episodic")} />
                <Toggle label="Semantic Memory" value={settings.allow_semantic} on={() => toggle("allow_semantic")} />
                <Toggle label="Procedural Memory" value={settings.allow_procedural} on={() => toggle("allow_procedural")} />
                <Toggle
                  label="Long Conversation Memory"
                  value={settings.allow_long_conversation_memory}
                  on={() => toggle("allow_long_conversation_memory")}
                />
              </CardContent>
            </Card>

            {/* Memory Lists */}
            <MemoryCard title="Episodic Memories" data={episodic} type="episodic" setData={setEpisodic} />
            <MemoryCard title="Semantic Memories" data={semantic} type="semantic" setData={setSemantic} />
            <MemoryCard title="Procedural Memories" data={procedural} type="procedural" setData={setProcedural} />
          </TabsContent>

          {/* ---------------- EXPENSES ---------------- */}
          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Expense dashboard coming soon.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Toggle({ label, value, on }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={!!value} onCheckedChange={on} />
    </div>
  );
}

function MemoryCard({ title, data, type, setData }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());

  const filtered = useMemo(() => {
    return data.filter((m) =>
      (m.content || m.fact || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function deleteSelected() {
    await fetch(`${API_URL}/memory/${type}/delete_selected`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    setData((prev) => prev.filter((m) => !selected.has(m.id)));
    setSelected(new Set());
  }

  async function deleteAll() {
    await fetch(`${API_URL}/memory/${type}/delete_all`, {
      method: "DELETE",
      credentials: "include",
    });
    setData([]);
    setSelected(new Set());
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={deleteSelected} disabled={!selected.size}>
            Delete Selected
          </Button>
          <Button size="sm" variant="destructive" onClick={deleteAll}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-2 max-h-64 overflow-auto">
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">No records</div>
          )}

          {filtered.map((m) => (
            <div key={m.id} className="flex items-start gap-2 border rounded p-2">
              <Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggleSelect(m.id)} />
              <div className="text-sm truncate">
                {m.content || m.fact || JSON.stringify(m)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


function MetricCard({ title, value }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}