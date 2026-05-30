import Link from "next/link";
import { Home, Calendar, Target, Users, Wallet, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/kegiatan", label: "Kegiatan", icon: Calendar },
  { href: "/visi-misi", label: "Visi & Misi", icon: Target },
  { href: "/warga", label: "Data Warga", icon: Users },
  { href: "/keuangan", label: "Keuangan", icon: Wallet },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
              RT
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">Portal RT</p>
              <p className="text-xs text-slate-500">Informasi Warga</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-2"
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          </nav>
        </div>

        <nav className="md:hidden flex gap-1 overflow-x-auto pb-3 -mx-1 scrollbar-hide">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 whitespace-nowrap transition-colors"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
