import Link from "next/link";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full bg-terracotta" />
          <span className="text-xs font-mono font-bold tracking-[0.2em] text-stone-gray uppercase">Internal Portal</span>
        </div>
        <Link href="/" className="text-4xl font-serif font-semibold text-near-black block">
          Topic AI Admin
        </Link>
      </div>
      
      <div className="w-full max-w-md bg-ivory border border-border-cream rounded-[32px] p-8 md:p-12 shadow-whisper">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif text-near-black mb-2">{title}</h1>
          {subtitle && <p className="text-olive-gray font-sans text-sm">{subtitle}</p>}
        </div>
        
        {children}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-stone-gray text-xs italic opacity-60">
          Secure, monitored environment. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
