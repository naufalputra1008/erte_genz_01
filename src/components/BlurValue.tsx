import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function BlurValue({ children, className }: Props) {
  return (
    <span title="Nilai dirahasiakan" className={className}>
      <span className="blur-[5px] select-none pointer-events-none" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
