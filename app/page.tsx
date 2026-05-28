import PublishForm from "@/components/PublishForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] py-10 px-4">
      {/* ambient glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-purple-500/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        {/* header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full glass text-xs text-violet-300 font-medium tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Car Content Studio
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-400 bg-clip-text text-transparent">
            CarReels Publisher
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Publica vídeos de carros no Instagram, TikTok e YouTube em simultâneo.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <PublishForm />
        </div>
      </div>
    </main>
  );
}
