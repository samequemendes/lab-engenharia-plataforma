import { ArrowRight, CalendarDays, Menu, PlayCircle, Shield, Trophy } from 'lucide-react';
import { highlights, navItems, news, rankings } from './data/homeData';
import RankingCard from './components/RankingCard';

export default function App() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <Hero />
      <RankingsSection />
      <HighlightsSection />
      <NewsSection />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a
          href="#home"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-600/30">
            <Shield className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="block text-lg font-black tracking-tight text-white">SparringDay</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-red-500">Fight Portal</span>
          </div>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-zinc-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#login"
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-red-500 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            Login
          </a>
        </div>

        <button className="rounded-xl border border-white/10 p-2 text-white md:hidden" aria-label="Abrir menu">
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(127,29,29,0.32),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.2),rgba(9,9,11,1)),url('https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-40" />

      <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.22em] text-red-400">
            Bem-vindo ao SparringDay
          </p>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">SparringDay</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
            O portal definitivo para acompanhar lutas, rankings, eventos, atletas e os grandes momentos do mundo dos esportes de combate.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#lutas"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-7 py-4 text-base font-bold text-white shadow-xl shadow-red-600/30 transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Próximas Lutas
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="#rankings"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-base font-bold text-white transition hover:border-red-500 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Ver Rankings
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <NextFightCard />
      </div>
    </section>
  );
}

function NextFightCard() {
  return (
    <aside id="lutas" className="rounded-[2rem] border border-white/10 bg-zinc-950/75 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="mb-5 flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-red-500" aria-hidden="true" />
        <h2 className="text-2xl font-black text-white">Próxima Luta</h2>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-red-600 to-red-950 p-px">
        <div className="rounded-3xl bg-zinc-950 p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-400">Main event</p>
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
            <FighterPreview name="Marcos Silva" record="12V • 1D" />
            <span className="text-2xl font-black text-red-500">VS</span>
            <FighterPreview name="João Torres" record="10V • 2D" />
          </div>
          <div className="mt-6 rounded-2xl bg-white/5 p-4 text-center">
            <p className="text-sm text-zinc-400">Sábado • 20:00 • Arena SparringDay</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function FighterPreview({ name, record }) {
  return (
    <div>
      <div className="mx-auto mb-3 h-20 w-20 rounded-full bg-zinc-800 ring-4 ring-red-600/40" />
      <p className="font-black text-white">{name}</p>
      <p className="text-sm text-zinc-400">{record}</p>
    </div>
  );
}

function RankingsSection() {
  return (
    <section id="rankings" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-red-500">Top 3 Rankings</p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Atletas no topo</h2>
        </div>
        <a href="#rankings-completo" className="inline-flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300">
          Ranking completo
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RankingCard title="Masculino" items={rankings.masculino} />
        <RankingCard title="Feminino" items={rankings.feminino} />
      </div>
    </section>
  );
}

function HighlightsSection() {
  return (
    <section id="destaques" className="border-y border-white/10 bg-white/[0.03]">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-red-500">Destaques</p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Tudo que movimenta o fight game</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl shadow-black/20">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/15 text-red-500">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-black text-white">{title}</h3>
              <p className="mt-3 leading-7 text-zinc-400">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSection() {
  return (
    <section id="noticias" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-red-500">Últimas Notícias</p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Acompanhe as novidades</h2>
        </div>
        <a href="#todas-noticias" className="inline-flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300">
          Ver todas as notícias
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className="grid gap-5">
        {news.map((item, index) => (
          <article
            key={item}
            className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-red-500/60 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-sm font-black text-white">
                0{index + 1}
              </span>
              <div>
                <h3 className="font-bold text-white group-hover:text-red-300">{item}</h3>
                <p className="mt-2 text-sm text-zinc-400">Atualização oficial • SparringDay News</p>
              </div>
            </div>
            <a href="#noticia" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-300 hover:text-white">
              Ler mais
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>© 2026 SparringDay. Todos os direitos reservados.</p>
        <p>Portal de lutas, rankings e eventos.</p>
      </div>
    </footer>
  );
}
