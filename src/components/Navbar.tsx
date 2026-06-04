import Link from "next/link";
import Image from "next/image";
import { Home, Calendar, Target, Users, Wallet } from "lucide-react";
import { KegiatanNotifyBell } from "@/components/KegiatanNotifyBell";

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
            <Image
              src="/logo.png"
              alt="Logo Info Warga 01 Taman Balaraja"
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow"
              priority
            />
            <div>
              <p className="font-bold text-slate-900 leading-tight">Info Warga 01 Taman Balaraja</p>
              <p className="text-xs text-slate-500">RT 01 Taman Balaraja</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
          <nav className="flex items-center gap-1">
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
          </nav>
          <KegiatanNotifyBell />
          </div>
        </div>

        <nav className="md:hidden flex gap-1 overflow-x-auto pb-3 -mx-1 scrollbar-hide items-center">
          <KegiatanNotifyBell />
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
