"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMe } from "@/services/authService";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await getMe();
      if (res.success) {
        setUser(res.data);
      }
    } catch (err) {
      setUser(null);
    }
  };

  if (user) return null;

  return (
    <footer className="bg-parchment border-t border-border-cream pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2">
            <Link href="/" className="text-2xl font-serif font-semibold text-near-black mb-6 block">
              Topic AI
            </Link>
            <p className="text-olive-gray max-w-sm leading-relaxed mb-8 font-sans">
              Securing APIs during development. AI-powered SAST/DAST, encrypted storage, and automated vulnerability scanning for modern DevSecOps.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-near-black uppercase tracking-wider mb-6 font-sans">Product</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li><Link href="/overview" className="text-olive-gray hover:text-terracotta transition-colors">Overview</Link></li>
              <li><Link href="/pricing" className="text-olive-gray hover:text-terracotta transition-colors">Pricing</Link></li>
              <li><Link href="/models" className="text-olive-gray hover:text-terracotta transition-colors">Models</Link></li>
              <li><Link href="/docs" className="text-olive-gray hover:text-terracotta transition-colors">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-near-black uppercase tracking-wider mb-6 font-sans">Company</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li><Link href="/about" className="text-olive-gray hover:text-terracotta transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="text-olive-gray hover:text-terracotta transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="text-olive-gray hover:text-terracotta transition-colors">Contact</Link></li>
              <li><Link href="/ory" className="text-terracotta font-bold hover:underline transition-all">Ory Integration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-near-black uppercase tracking-wider mb-6 font-sans">Legal</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li><Link href="/privacy" className="text-olive-gray hover:text-terracotta transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-olive-gray hover:text-terracotta transition-colors">Terms</Link></li>
              <li><Link href="/cookies" className="text-olive-gray hover:text-terracotta transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-border-cream/50 gap-6">
          <p className="text-stone-gray text-sm font-sans">
            © {currentYear} Abdul Ahad, M. Faizan, M. Hayyan | BS CYBER B | Assignment # 02. All rights reserved.
          </p>
          <div className="flex gap-6 font-sans">
            <Link href="#" className="text-stone-gray hover:text-near-black transition-colors">Twitter</Link>
            <Link href="#" className="text-stone-gray hover:text-near-black transition-colors">LinkedIn</Link>
            <Link href="#" className="text-stone-gray hover:text-near-black transition-colors">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
