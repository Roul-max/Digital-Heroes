export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">LeadRouter</h1>
          <p className="text-sm text-neutral-500 mt-1">Intelligent lead routing for sales teams</p>
        </div>
        {children}
      </div>
    </div>
  );
}
