import { SOCIAL_LINKS } from "@/lib/social";
import { InstagramIcon, YoutubeIcon } from "@/components/SocialIcons";

const socialItems = [
  {
    key: "instagram",
    href: SOCIAL_LINKS.instagram,
    label: "Instagram RT 01 Taman Balaraja",
    Icon: InstagramIcon,
    className: "hover:text-pink-600 hover:bg-pink-50",
  },
  {
    key: "youtube",
    href: SOCIAL_LINKS.youtube,
    label: "YouTube RT 01 Taman Balaraja",
    Icon: YoutubeIcon,
    className: "hover:text-red-600 hover:bg-red-50",
  },
].filter((item) => item.href);

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-500">
        <p>Info Warga 01 Taman Balaraja — Transparansi untuk Warga</p>
        <p className="mt-1 text-xs">Data diperbarui secara otomatis setiap 10 detik</p>

        {socialItems.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            {socialItems.map(({ key, href, label, Icon, className }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors ${className}`}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        )}

        <p className="mt-3 text-xs text-slate-400">Created by Naufal Putra</p>
      </div>
    </footer>
  );
}
