"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Search, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { fetchExpenses } from "@/api/expenses";
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";

import {
  fetchMemoryMetrics,
  fetchMemorySettings,
  fetchSemanticMemories,
  fetchEpisodicRecentMemories,
  fetchProceduralMemories,
} from "@/api/user_memory";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ---------- tiny helpers ---------- */
const colors = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

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
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-16 pb-20">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Tabs defaultValue="memory">
                <TabsList className="grid w-full max-w-xl grid-cols-3 rounded-xl bg-black/10 backdrop-blur">
                  <TabsTrigger value="memory">User Memory</TabsTrigger>
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                  {/* <TabsTrigger value="pii">PII & Metrics</TabsTrigger> */}
                </TabsList>

                <AnimatePresence mode="wait">
                  {/* ----------- PII ----------- */}
                  {/* <TabsContent key="pii" value="pii" className="space-y-4">
                    <Grid4>
                      <MetricCard title="Extractions Total" value={metrics.extraction_total ?? 0} delay={0} />
                      <MetricCard title="Extraction Failures" value={metrics.extraction_failures ?? 0} delay={0.1} />
                      <MetricCard title="Semantic Saved (plain)" value={metrics.semantic_saved?.plaintext ?? 0} delay={0.2} />
                      <MetricCard title="Semantic Saved (encrypted)" value={metrics.semantic_saved?.encrypted ?? 0} delay={0.3} />
                      <MetricCard title="Semantic Versioned" value={metrics.semantic_versioned ?? 0} delay={0.4} />
                    </Grid4>

                    <GlassCard>
                      <CardHeader>
                        <CardTitle>PII Encrypted Counters</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-3 text-sm md:grid-cols-3">
                        {metrics.pii_encrypted ? (
                          Object.entries(metrics.pii_encrypted).map(([k, v], i) => (
                            <motion.div
                              key={k}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex justify-between border rounded-lg p-3 bg-white/5 backdrop-blur"
                            >
                              <span className="capitalize">{k.replace(/_/g, " ")}</span>
                              <span className="font-semibold">{v ?? 0}</span>
                            </motion.div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">No PII metrics yet</span>
                        )}
                      </CardContent>
                    </GlassCard>
                  </TabsContent> */}

                  {/* ----------- MEMORY ----------- */}
                  <TabsContent key="memory" value="memory" className="space-y-6">
                    <GlassCard>
                      <CardHeader>
                        <CardTitle>Memory Controls</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Toggle label="Episodic Memory" value={settings.allow_episodic} on={() => toggle("allow_episodic")} delay={0} />
                        <Toggle label="Semantic Memory" value={settings.allow_semantic} on={() => toggle("allow_semantic")} delay={0.1} />
                        <Toggle label="Procedural Memory" value={settings.allow_procedural} on={() => toggle("allow_procedural")} delay={0.2} />
                        <Toggle label="Long Conversation Memory" value={settings.allow_long_conversation_memory} on={() => toggle("allow_long_conversation_memory")} delay={0.3} />
                      </CardContent>
                    </GlassCard>

                    <MemoryCard title="Episodic Memories" data={episodic} type="episodic" setData={setEpisodic} />
                    <MemoryCard title="Semantic Memories" data={semantic} type="semantic" setData={setSemantic} />
                    <MemoryCard title="Procedural Memories" data={procedural} type="procedural" setData={setProcedural} />
                  </TabsContent>

                  {/* ----------- EXPENSES ----------- */}
                  <TabsContent key="expenses" value="expenses">
                    <ExpensesDashboard />
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </motion.div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

/* ---------- styled components ---------- */
function Grid4({ children }) {
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

function GlassCard({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">{children}</Card>
    </motion.div>
  );
}

function MetricCard({ title, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Toggle({ label, value, on, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center justify-between"
    >
      <span className="text-sm">{label}</span>
      <Switch checked={!!value} onCheckedChange={on} />
    </motion.div>
  );
}

function MemoryCard({ title, data, type, setData }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const isRules = type === "procedural"; // procedural = single list

  const filtered = useMemo(() => {
    return data.filter((m) => (m.content || m.fact || "").toLowerCase().includes(search.toLowerCase()));
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
      method: "POST",
      credentials: "include",
    });
    setData([]);
    setSelected(new Set());
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button size="sm" variant="outline" onClick={deleteSelected} disabled={!selected.size} className={isRules ? "hidden" : ""}>
              Delete Selected
            </Button>
            <Button size="sm" variant="destructive" onClick={deleteAll}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete All
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <AnimatePresence>
            {filtered.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-muted-foreground"
              >
                No records
              </motion.div>
            )}

            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {filtered.map((m) => (
                <motion.div
                  key={`memory-${type}-${m.id}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-start gap-2 border rounded-lg p-2 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {!isRules && (
                    <Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggleSelect(m.id)} />
                  )}
                  <div className="text-sm whitespace-pre-line">{m.content || m.fact || prettyRules(m)}</div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
}

function prettyRules(obj) {
  if (!obj.rules) return JSON.stringify(obj); // fallback
  try {
    const list = JSON.parse(obj.rules); // expect ["rule1","rule2"]
    if (!Array.isArray(list) || list.length === 0) return "—";
    return list.map((r, i) => `• ${r}`).join("\n"); // bullet list
  } catch {
    return String(obj.rules); // not valid JSON → plain text
  }
}

function ExpensesDashboard() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ type: "", category_id: "", date: "", start_date: "", end_date: "" });

  useEffect(() => {
    fetchExpenses(filters).then((res) => {
      setData(res.items);
      setSummary(res.summary);
    });
  }, [filters]);

  return (
    <>
      {/* KPI */}
      {summary && (
        <div className="grid md:grid-cols-3 gap-4 mb-3">
          <KpiCard icon={<DollarSign />} title="Monthly Total" value={`₹ ${summary.monthly_total}`} color="text-green-400" />
          <KpiCard icon={<TrendingDown />} title="Debit" value={`₹ ${summary.debit_total}`} color="text-red-400" />
          <KpiCard icon={<TrendingUp />} title="Credit" value={`₹ ${summary.credit_total}`} color="text-blue-400" />
        </div>
      )}

      {/* Filters */}
      <div className="mb-3">
        <GlassCard >
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-5 gap-3">
            <Input placeholder="Today / Yesterday" onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} />
            <Input placeholder="Category ID" onChange={(e) => setFilters((f) => ({ ...f, category_id: e.target.value }))} />
            <select
              className="border rounded px-2 bg-background"
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              value={filters.type}
            >
              <option value="">All</option>
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
            <Input type="date" onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))} />
            <Input type="date" onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))} />
          </CardContent>
        </GlassCard>
      </div>

      {/* Table */}
      <GlassCard>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-auto pr-1 mt-3">
            <AnimatePresence>
              {data.map((e, i) => (
                <motion.div
                  key={`expense-${e.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex justify-between items-center border rounded-lg p-3 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="text-sm">{e.date}</div>
                  <div className="text-sm">
                    {e.category.name} / {e.subcategory.name}
                  </div>
                  <div className={`text-xs font-semibold ${e.type === "debit" ? "text-red-400" : "text-green-400"}`}>
                    {e.type.toUpperCase()}
                  </div>
                  <div className="font-semibold">₹ {e.amount}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </GlassCard>

      {/* Charts */}
      {summary && (
        <div className="grid md:grid-cols-2 gap-6 mt-3">
          <ChartCard title="Category Breakdown">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={summary.by_category} dataKey="total" nameKey="name" label>
                  {summary.by_category.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Debit vs Credit">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Debit", value: summary.debit_total },
                    { name: "Credit", value: summary.credit_total },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </>
  );
}

function KpiCard({ icon, title, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard>
        <CardContent className="flex items-center gap-4">
          <div className={`text-3xl ${color}`}>{icon}</div>
          <div>
            <div className="text-sm text-muted-foreground">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
}

function ChartCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </GlassCard>
    </motion.div>
  );
}