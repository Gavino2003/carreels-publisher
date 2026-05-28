import PublishForm from "@/components/PublishForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">CarReels Publisher</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Publica vídeos de carros no Instagram, TikTok e YouTube em simultâneo.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          <PublishForm />
        </div>
      </div>
    </main>
  );
}
