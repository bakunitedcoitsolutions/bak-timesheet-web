"use client";
import React from "react";
import Link from "next/link";
import { classNames } from "primereact/utils";

type ActionConfig = {
  label: string;
  href: string;
  external?: boolean;
};

type NotFoundStateProps = {
  statusCode?: string | number;
  title?: string;
  description?: string;
  hint?: string;
  primaryAction?: ActionConfig | null;
  className?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

const defaultDescription =
  "The page you are looking for does not exist. It might have been removed, renamed, or is temporarily unavailable.";

function NotFoundState({
  statusCode = "404",
  title = "Oops! Page Not Found",
  description = defaultDescription,
  primaryAction = { label: "Back to home", href: "/" },
  className,
  actions,
  children,
}: NotFoundStateProps) {
  const renderLink = ({ label, href, external }: ActionConfig) => (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={classNames(
        "inline-flex min-w-[150px] items-center justify-center rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "bg-primary text-white hover:bg-primary/90"
      )}
    >
      {label}
    </Link>
  );

  const actionNode =
    actions ??
    (primaryAction ? (
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {primaryAction && renderLink(primaryAction)}
      </div>
    ) : null);

  return (
    <section
      className={classNames(
        "relative isolate flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white px-6 py-16 text-center",
        className
      )}
    >
      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-5">
        <h1
          className="text-[clamp(4rem,18vw,10rem)] font-black leading-none text-transparent"
          style={{
            WebkitTextStroke: "6px #0f172a",
          }}
        >
          {statusCode}
        </h1>
        <h2 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base text-neutral-600 md:text-lg">
          {description}
        </p>
        {children}
        {actionNode}
      </div>
    </section>
  );
}

export default NotFoundState;
