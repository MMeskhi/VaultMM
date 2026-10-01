import type { ComponentPropsWithoutRef } from "react";

export function Tag({
  children,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button">) {
  return (
    <button type="button" className={`tag ${className}`} {...props}>
      {children}
    </button>
  );
}
