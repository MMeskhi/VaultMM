import { useId } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type FieldProps = { label: string; hint?: string };

export function Input({
  label,
  hint,
  id,
  ...props
}: ComponentPropsWithoutRef<"input"> & FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="field">
      <label htmlFor={fieldId}>
        {label}
        {hint && <span> · {hint}</span>}
      </label>
      <input id={fieldId} {...props} />
    </div>
  );
}

export function Textarea({
  label,
  hint,
  id,
  ...props
}: ComponentPropsWithoutRef<"textarea"> & FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="field">
      <label htmlFor={fieldId}>
        {label}
        {hint && <span> · {hint}</span>}
      </label>
      <textarea id={fieldId} {...props} />
    </div>
  );
}

export function Select({
  label,
  id,
  children,
  ...props
}: ComponentPropsWithoutRef<"select"> & FieldProps & { children: ReactNode }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      <select id={fieldId} {...props}>
        {children}
      </select>
    </div>
  );
}
