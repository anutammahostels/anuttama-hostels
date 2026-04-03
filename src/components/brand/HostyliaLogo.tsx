interface HostyliaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark" | "auto";
  animated?: boolean;
}

const sizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

export const HostyliaLogo = ({
  size = "md",
  className = "",
  variant = "auto",
  animated = false,
}: HostyliaLogoProps) => {
  const textColor =
    variant === "dark"
      ? "text-white"
      : variant === "light"
        ? "text-foreground"
        : "text-foreground";

  return (
    <div className={`flex items-center ${className}`}>
      <span
        className={`${sizeMap[size]} font-bold tracking-tight ${textColor} ${animated ? "animate-float" : ""}`}
      >
        Anuttama
      </span>
    </div>
  );
};
