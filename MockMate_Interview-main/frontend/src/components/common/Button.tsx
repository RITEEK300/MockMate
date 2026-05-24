import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'bg-coral text-ink hover:bg-[#ff7d59]',
  secondary: 'bg-mint text-ink hover:bg-[#26c8a9]',
  ghost: 'bg-white/10 text-white hover:bg-white/15',
  danger: 'bg-red-500 text-white hover:bg-red-400'
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`min-h-11 rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
