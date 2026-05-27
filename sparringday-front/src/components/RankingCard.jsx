import { Trophy } from 'lucide-react';

export default function RankingCard({ title, items }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <Trophy className="h-5 w-5 text-red-500" aria-hidden="true" />
      </div>

      <div className="space-y-4">
        {items.map((fighter) => (
          <div key={fighter.name} className="flex items-center gap-4 rounded-2xl bg-black/30 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white">
              {fighter.pos}
            </span>
            <div>
              <p className="font-semibold text-white">{fighter.name}</p>
              <p className="text-sm text-zinc-400">
                {fighter.category} • {fighter.record}
              </p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
