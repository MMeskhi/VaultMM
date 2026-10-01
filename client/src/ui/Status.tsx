import type { ReactNode } from "react";

export function Status({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`status ${error ? "status--error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
