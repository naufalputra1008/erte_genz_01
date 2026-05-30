interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}
