import { LucideIcon } from "lucide-react";
import { BlurValue } from "@/components/BlurValue";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: "emerald" | "blue" | "amber" | "rose";
  blurHalf?: boolean;
  blurSubtitle?: boolean;
  variant?: "default" | "modern";
}

const gradientMap = {
  emerald: "from-emerald-500 to-teal-600",
  blue: "from-blue-500 to-indigo-600",
  amber: "from-amber-500 to-orange-600",
  rose: "from-rose-500 to-pink-600",
};

const modernIconMap = {
  blue: "bg-blue-100 text-[#004ac6]",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-orange-50 text-amber-700",
  rose: "bg-rose-50 text-rose-600",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  blurHalf,
  blurSubtitle,
  variant = "default",
}: StatCardProps) {
  if (variant === "modern") {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--rt-border)] hover:-translate-y-1 transition-all group">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</span>
          <div className={`p-2 rounded-lg ${modernIconMap[color]} group-hover:scale-110 transition-transform`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-[1.75rem] leading-tight font-bold text-slate-900">
          {blurHalf ? <BlurValue>{value}</BlurValue> : value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">
            {blurSubtitle ? <BlurValue>{subtitle}</BlurValue> : subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {blurHalf ? <BlurValue>{value}</BlurValue> : value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">
              {blurSubtitle ? <BlurValue>{subtitle}</BlurValue> : subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientMap[color]} text-white shadow-md`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
