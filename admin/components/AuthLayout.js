import Link from "next/link";
import { Shield } from "lucide-react";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-terracotta/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-near-black/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mb-12 text-center relative z-10">
        <Link href="/" className="flex flex-col items-center gap-4 group">
          <div className="w-16 h-16 bg-near-black text-ivory rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-near-black tracking-tight block">
              Topic AI <span className="text-terracotta italic">Admin</span>
            </span>
            <div className="h-0.5 w-12 bg-terracotta mx-auto mt-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 md:p-12 shadow-2xl relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-serif text-near-black mb-3 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-stone-gray font-sans text-sm leading-relaxed max-w-[280px] mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>

      <div className="mt-12 text-center relative z-10">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-gray/40">
          SECURE INFRASTRUCTURE • MONITORING ACTIVE
        </p>
      </div>
    </div>
  );
}

