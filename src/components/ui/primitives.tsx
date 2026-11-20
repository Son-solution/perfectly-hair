import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("container-luxe", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-eyebrow font-medium uppercase", className)}
      {...props}
    />
  );
}

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonTone = "dark" | "light";

const base =
  "group inline-flex min-h-12 items-center justify-center gap-3 px-7 text-[0.8125rem] font-medium uppercase tracking-[0.2em] transition-colors duration-500 ease-luxe";

const variants: Record<ButtonTone, Record<ButtonVariant, string>> = {
  dark: {
    solid: "bg-ink text-white hover:bg-graphite",
    outline: "border border-ink text-ink hover:bg-ink hover:text-white",
    ghost: "px-0 text-ink",
  },
  light: {
    solid: "bg-white text-ink hover:bg-mist",
    outline: "border border-white/60 text-white hover:bg-white hover:text-ink",
    ghost: "px-0 text-white",
  },
};

export function ButtonLink({
  href,
  children,
  variant = "solid",
  tone = "dark",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  className?: string;
}) {
  const classes = cn(base, variants[tone][variant], className);
  const content = (
    <>
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="inline-block h-px w-6 bg-current transition-[width] duration-500 ease-luxe group-hover:w-10"
      />
    </>
  );

  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
        <span className="sr-only"> (öffnet in neuem Tab)</span>
      </a>
    );
  }
  if (/^(tel|mailto):/.test(href)) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

/** Honest image slot until the owner supplies real photography. */
export function ImagePlaceholder({
  label = "Bild folgt",
  className,
  tone = "dark",
}: {
  label?: string;
  className?: string;
  tone?: ButtonTone;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex h-full w-full items-end p-5",
        tone === "dark"
          ? "bg-[radial-gradient(ellipse_at_30%_20%,#3a3a3a_0%,#1c1c1c_45%,#0a0a0a_100%)] text-ash"
          : "bg-[radial-gradient(ellipse_at_30%_20%,#ffffff_0%,#f2f2f2_50%,#d9d9d9_100%)] text-stone",
        className,
      )}
    >
      <span className="text-eyebrow uppercase">{label}</span>
    </div>
  );
}
