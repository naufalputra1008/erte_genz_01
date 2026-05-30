import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: "emerald" | "blue" | "amber" | "rose";
}

const colorMap = {
  emerald: "from-emerald-500 to-teal-600",
  blue: "from-blue-500 to-indigo-600",
  amber: "from-amber-500 to-orange-600",
  rose: "from-rose-500 to-pink-600",
};

export function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-md`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
