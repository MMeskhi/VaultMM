import type { ComponentPropsWithoutRef } from "react";

export function Panel({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={`panel ${className}`} {...props} />;
}
