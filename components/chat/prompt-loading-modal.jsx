export default function LoadingModal({ message = "Processing…" }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      {/* card */}
      <div className="relative rounded-2xl border bg-card px-6 py-5 shadow-lg">
        <div className="flex items-center gap-4">
          {/* animated bars */}
          <div className="flex items-center justify-center gap-0.5 h-5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-0.5 rounded-full bg-purple-500"
                style={{
                  height: '100%',
                  animation: 'wave 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}