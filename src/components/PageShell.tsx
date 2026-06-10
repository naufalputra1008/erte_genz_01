type Props = {
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ children, className = "" }: Props) {
  return (
    <div className={`max-w-[1200px] mx-auto px-4 sm:px-6 py-8 font-[family-name:var(--font-display)] ${className}`}>
      {children}
    </div>
  );
}
