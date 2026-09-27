export function MainButton({
  children,
  onClick,
  size,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}) {
  return (
    <button
      className={`bg-blue-500 text-white px-4 py-2 rounded cursor-pointer ${size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : ""}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}
