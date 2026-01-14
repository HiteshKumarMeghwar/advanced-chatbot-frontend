import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { Check, Copy, Rocket, Zap, Lightbulb, Star, Info, ExternalLink, ChevronDown, ChevronUp, Code, Image as ImageIcon, Table as TableIcon, Quote } from "lucide-react"; // Assuming lucide-react is imported for icons

// Additional imports for enhanced features (if needed, e.g., for collapsible sections)
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"; // Assume shadcn/ui or similar for advanced UI components

const AdvancedMarkdownRenderer = ({ text, raw }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
      components={{
        /* Enhanced Code blocks with copy, language detection, and stylish border */
        pre: ({ children, ...props }) => {
          const [copied, setCopied] = useState(false);
          const [isExpanded, setIsExpanded] = useState(true); // For collapsible long code

          const code =
            typeof raw === "string"
              ? raw.match(/```[\s\S]*?```/)?.[0]
                  ?.replace(/```[a-zA-Z]*\n?/, "")
                  ?.replace(/```$/, "")
              : "";

          const handleCopy = async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch (err) {
              console.error("Copy failed", err);
            }
          };

          // Detect if code is long for collapsibility
          const isLongCode = code.split("\n").length > 20;

          return (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="relative my-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Code Block</span>
                </div>
                {isLongCode && (
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {isExpanded ? "Collapse" : "Expand"}
                    </button>
                  </CollapsibleTrigger>
                )}
              </div>
              <CollapsibleContent>
                <div className="relative">
                  <button
                    onClick={handleCopy}
                    className="
                      absolute right-2 top-2 rounded px-2 py-1 text-xs
                      flex items-center gap-1
                      bg-muted text-foreground
                      dark:bg-black/70 dark:text-white
                      hover:opacity-80 transition
                      m-2
                    "
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                  <pre
                    className="
                      rounded-lg p-4 overflow-x-auto text-sm
                      bg-muted text-foreground border border-indigo-300 dark:border-indigo-700
                      dark:bg-black/90 dark:text-gray-100 shadow-md
                    "
                    {...props}
                  >
                    {children}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        },

        /* Inline code with stylish background */
        code: ({ node, inline, children, ...props }) => (
          <code
            className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md text-sm font-mono text-indigo-600 dark:text-indigo-400"
            {...props}
          >
            {children}
          </code>
        ),

        /* Stylish HR with emoji-like stars */
        hr: ({ children }) => (
          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1" />
            <Star className="w-5 h-5 text-yellow-500 animate-pulse" />
            <div className="h-px bg-slate-300 dark:bg-slate-700 flex-1" />
          </div>
        ),

        /* H1 with rocket emoji and gradient */
        h1: ({ children }) => (
          <div className="flex items-center gap-3 mb-4 mt-6">
            <Rocket className="w-8 h-8 text-indigo-500 animate-bounce" />
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {children}
            </h1>
          </div>
        ),

        /* H2 with zap and shadow */
        h2: ({ children }) => (
          <div className="flex items-center gap-2 mt-5 mb-3">
            <Zap className="text-yellow-500 w-6 h-6" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 shadow-sm">{children}</h2>
          </div>
        ),

        /* H3 with lightbulb and subtle animation */
        h3: ({ children }) => (
          <div className="flex items-center gap-2 mt-4 mb-2">
            <Lightbulb className="w-5 h-5 text-amber-500 hover:animate-spin" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{children}</h3>
          </div>
        ),

        /* Unordered lists with custom bullets (checkmarks or emojis) */
        ul: ({ children }) => <ul className="list-none space-y-3 ml-4 my-3">{children}</ul>,

        /* Ordered lists with stylish numbers */
        ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 my-3 font-medium">{children}</ol>,

        /* List items with dynamic check or arrow based on content */
        li: ({ children }) => (
          <li className="flex items-start gap-3">
            <span className="mt-1 text-indigo-500">
              <Check className="w-5 h-5" />
            </span>
            <span className="flex-1 text-base leading-relaxed">{children}</span>
          </li>
        ),

        /* Blockquote with info icon and gradient border */
        blockquote: ({ children }) => (
          <div className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 p-4 my-4 rounded-r-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Quote className="w-5 h-5 text-purple-600 rotate-180" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Insight</span>
            </div>
            <div className="text-slate-700 dark:text-slate-300 italic">{children}</div>
          </div>
        ),

        /* Strong text with bold and color */
        strong: ({ children }) => (
          <span className="font-extrabold text-indigo-700 dark:text-indigo-300">{children}</span>
        ),

        /* Em with italic and subtle color */
        em: ({ children }) => (
          <span className="italic text-pink-600 dark:text-pink-400 underline decoration-wavy">{children}</span>
        ),

        /* Links with external icon and hover effect */
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline hover:scale-105 transition"
          >
            {children}
            <ExternalLink className="w-4 h-4" />
          </a>
        ),

        /* Paragraphs with better spacing and readability */
        p: ({ children }) => <p className="text-base md:text-lg leading-relaxed my-3 text-slate-600 dark:text-slate-300">{children}</p>,

        /* Images with caption support and responsive sizing */
        img: ({ src, alt }) => (
          <div className="my-4 rounded-lg overflow-hidden shadow-lg">
            <img src={src} alt={alt} className="max-w-full h-auto mx-auto" />
            {alt && <p className="text-center text-sm text-gray-500 mt-2 italic">{alt}</p>}
          </div>
        ),

        /* Tables with zebra striping and icons */
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800">
              <TableIcon className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-semibold">Data Table</span>
            </div>
            <table className="table-auto w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-gray-200 dark:bg-gray-700">{children}</thead>,
        th: ({ children }) => (
          <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-200 border-b border-gray-300 dark:border-gray-600">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 even:bg-gray-50 dark:even:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {children}
          </td>
        ),

        /* Strikethrough support */
        del: ({ children }) => <del className="line-through text-gray-500 dark:text-gray-400">{children}</del>,

        /* Task lists with interactive checkboxes (read-only) */
        input: ({ type, checked }) =>
          type === "checkbox" ? (
            <input type="checkbox" checked={checked} readOnly className="mr-3 w-5 h-5 accent-indigo-500" />
          ) : null,
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default AdvancedMarkdownRenderer;