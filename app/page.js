"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  Bot, Zap, Image as ImageIcon, Mic, Server, Shield, Mail, Facebook,
  Github, Twitter, Instagram, ChevronLeft, ChevronRight, Star,
  ArrowRight, CheckCircle, Palette, Settings, UserPlus,
} from "lucide-react";

/* ----------  carousel slides  ---------- */
const slides = [
  {
    title: "Converse naturally",
    desc: "Real-time voice commands with built-in VAD.",
    icon: <Mic className="w-10 h-10" />,
    color: "from-purple-600 to-pink-600",
  },
  {
    title: "See & Ask",
    desc: "Upload an image → instant OCR + explanation.",
    icon: <ImageIcon className="w-10 h-10" />,
    color: "from-blue-600 to-cyan-600",
  },
  {
    title: "Your data, your answers",
    desc: "RAG pipeline hooks into any document store.",
    icon: <Server className="w-10 h-10" />,
    color: "from-green-600 to-teal-600",
  },
  {
    title: "Plug-and-play tools",
    desc: "MCP servers, social accounts, toggles per user.",
    icon: <Settings className="w-10 h-10" />,
    color: "from-orange-600 to-yellow-600",
  },
];

/* ----------  counters (client-only)  ---------- */
function Counter({ value, label }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let i = 0;
    const int = setInterval(() => {
      i += 1;
      if (i > value) return clearInterval(int);
      setCurrent(i);
    }, 30);
    return () => clearInterval(int);
  }, [value]);
  return (
    <div className="text-center">
      <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        {current}+
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

/* ----------  feature card  ---------- */
function Feature({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative group p-6 rounded-2xl bg-white/40 dark:bg-gray-900/40 border border-white/20 dark:border-gray-800 backdrop-blur-xl shadow-lg hover:shadow-indigo-500/20 transition"
    >
      <div className="mb-4 w-12 h-12 grid place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </motion.div>
  );
}

/* ----------  hero carousel  ---------- */
function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-3xl shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${slides[idx].color} text-white p-8 flex flex-col justify-center items-center text-center`}>
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="space-y-3"
          >
            {slides[idx].icon}
            <h2 className="text-2xl md:text-4xl font-bold">{slides[idx].title}</h2>
            <p className="text-sm md:text-base opacity-90">{slides[idx].desc}</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* manual arrows */}
      <button
        onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/20 hover:bg-white/40 text-white transition"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setIdx((i) => (i + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/20 hover:bg-white/40 text-white transition"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-2 rounded-full transition ${i === idx ? "w-6 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ----------  main page  ---------- */
export default function HomePage() {
  const features = [
    { icon: <Mic className="w-6 h-6" />, title: "Voice Commands", desc: "Hands-free chat with VAD auto-stop." },
    { icon: <ImageIcon className="w-6 h-6" />, title: "Image OCR", desc: "Drop a picture; get instant text + explanation." },
    { icon: <Server className="w-6 h-6" />, title: "RAG Ready", desc: "Connect your docs for contextual answers." },
    { icon: <Settings className="w-6 h-6" />, title: "User Toggle Tools", desc: "Allow / deny any tool yourself." },
    { icon: <Facebook className="w-6 h-6" />, title: "Social Integrations", desc: "Link Gmail, Facebook, GitHub, Twitter." },
    { icon: <Palette className="w-6 h-6" />, title: "Pick Your LLM", desc: "Switch between GPT-4o, Gemini, Claude, Groq." },
    { icon: <Shield className="w-6 h-6" />, title: "MCP Servers", desc: "Add remote MCP servers on the fly." },
    { icon: <UserPlus className="w-6 h-6" />, title: "Multi-Account", desc: "Personal & team workspaces." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-black">
      {/* ---- HEADER ---- */}
      <Header />

      <main className="max-w-7xl mx-auto px-6 mt-4 pb-20 space-y-20">
        {/* ---- HERO ---- */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Your AI,
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Super-charged</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Voice, images, documents, social accounts and 20+ tools—one chat. Switch LLMs on the fly, plug in MCP servers, and keep full control.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">Live Demo</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <HeroCarousel />
          </motion.div>
        </section>

        {/* ---- STATS ---- */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Counter value={12} label="AI Models" />
          <Counter value={25} label="Tools" />
          <Counter value={5} label="Social Platforms" />
          <Counter value={99} label="Uptime %" />
        </section>

        {/* ---- FEATURES ---- */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Everything you need</h2>
            <p className="text-muted-foreground">And more under the hood</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Feature {...f} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ---- CTA ---- */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 p-10 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 space-y-4 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Ready to try?</h2>
            <p className="text-lg opacity-90">Create an account in 10 seconds and start talking to your new super-bot.</p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Create free account
              </Button>
            </Link>
          </motion.div>

          {/* glowing orb */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </section>
      </main>

      {/* ---- FOOTER ---- */}
      <Footer />
    </div>
  );
}