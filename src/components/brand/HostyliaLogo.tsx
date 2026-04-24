import anuttamaLogo from "@/assets/anuttama-logo.png";

interface HostyliaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark" | "auto";
  animated?: boolean;
}

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

const imageSizeMap = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
  xl: "h-14 w-14",
};

const gapMap = {
  sm: "gap-2",
  md: "gap-2.5",
  lg: "gap-3",
  xl: "gap-3",
};

export const HostyliaLogo = ({
  size = "md",
  className = "",
  showText = true,
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
    <div className={`flex items-center ${gapMap[size]} ${className}`}>
      <img
        src={anuttamaLogo}
        alt="Anuttama Enterprises LLP"
        className={`${imageSizeMap[size]} shrink-0 rounded-xl object-cover overflow-hidden ring-1 ring-black/5 shadow-sm ${animated ? "animate-float" : ""}`}
        loading="eager"
        decoding="async"
      />
      {showText && (
        <span
          className={`${textSizeMap[size]} font-bold tracking-tight ${textColor}`}
        >
          Anuttama
        </span>
      )}
    </div>
  );
};
