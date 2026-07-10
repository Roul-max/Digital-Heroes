import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LeadRouter — Intelligent Lead Routing CRM",
  description:
    "Automatically route inbound leads to the right sales rep with configurable rules, real-time SLA tracking, and a full audit log.",
  alternates: { canonical: "/" },
};

const features = [
  {
    title: "Automatic lead routing",
    description:
      "Priority-ordered rules match on region, deal size, and product line. First match wins — no manual triage.",
  },
  {
    title: "Round-robin & direct assignment",
    description:
      "Distribute leads fairly across your team or pin high-value accounts to a specific rep.",
  },
  {
    title: "Real-time SLA tracking",
    description:
      "Live countdown per lead. Turns amber at 30 minutes, red on breach — so nothing slips through.",
  },
  {
    title: "Admin dashboard",
    description:
      "Leads routed today, average response time, SLA breach rate, and per-rep workload bars — all above the fold.",
  },
  {
    title: "Immutable audit log",
    description:
      "Every routing decision and status change is recorded with actor and timestamp. Append-only, no edits.",
  },
  {
    title: "RBAC — Admin & Rep roles",
    description:
      "Admins configure rules and manage the team. Reps see only their own leads. Enforced server-side on every route.",
  },
];

const faqs = [
  {
    question: "Is LeadRouter free to use?",
    answer:
      "Yes. LeadRouter is open-source and free. You can self-host it on Vercel with a free Neon or Supabase Postgres database.",
  },
  {
    question: "Does it work offline?",
    answer:
      "LeadRouter is a server-rendered web application and requires an internet connection. All data is persisted in PostgreSQL.",
  },
  {
    question: "How does SLA tracking work?",
    answer:
      "When a lead is routed, a countdown timer starts. The SLA window is configurable via the SLA_HOURS environment variable (default: 2 hours). The timer turns amber at 30 minutes remaining and red on breach.",
  },
  {
    question: "Can I integrate LeadRouter with my CRM?",
    answer:
      "A webhook intake endpoint (POST /api/leads/ingest) is on the roadmap. Currently, leads can be created via the admin dashboard or the CSV export can be used for data sync.",
  },
  {
    question: "How is data secured?",
    answer:
      "Passwords are hashed with bcrypt (cost 12). Sessions use httpOnly JWT cookies. Every mutation is authorized server-side at the row level. Rate limiting protects auth and export routes.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Nav */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-base font-semibold text-neutral-900 tracking-tight">LeadRouter</span>
          <nav aria-label="Site navigation" className="flex items-center gap-4">
            <Link
              href="#features"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors hidden sm:block"
            >
              Features
            </Link>
            <Link
              href="#faq"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors hidden sm:block"
            >
              FAQ
            </Link>
            <Link
              href="/login"
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight leading-tight max-w-2xl mx-auto">
            Route inbound leads to the right rep — automatically.
          </h1>
          <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto">
            Configurable routing rules, real-time SLA countdowns, and a full audit log. Built for
            sales teams that can&apos;t afford to let leads go cold.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Sign in to dashboard
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Create account
            </Link>
          </div>
          <p className="mt-4 text-xs text-neutral-400">
            Demo login — Admin: <code className="font-mono">demo@demo.com</code> / Rep:{" "}
            <code className="font-mono">rep1@demo.com</code> · password:{" "}
            <code className="font-mono">demo1234</code>
          </p>
        </section>

        {/* Features */}
        <section id="features" className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ title, description }) => (
              <article
                key={title}
                className="bg-white rounded-xl border border-neutral-200 p-6"
              >
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 pb-20">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map(({ question, answer }) => (
              <article
                key={question}
                className="bg-white rounded-xl border border-neutral-200 p-6"
              >
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">{question}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between text-xs text-neutral-400">
          <span>LeadRouter · Open Source</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/rohit/leadrouter"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-600 transition-colors"
            >
              GitHub →
            </a>
            <Link href="/login" className="hover:text-neutral-600 transition-colors">
              Sign in →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
