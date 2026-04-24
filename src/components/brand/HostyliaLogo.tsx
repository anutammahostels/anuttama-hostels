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

  // Subtle white ring behind the crest on dark backgrounds for legibility
  const crestWrapper =
    variant === "dark"
      ? "rounded-full bg-white/95 p-0.5 shadow-sm ring-1 ring-white/20"
      : "";

  return (
    <div className={`flex items-center ${gapMap[size]} ${className}`}>
      <span className={`inline-flex items-center justify-center ${crestWrapper}`}>
        <img
          src={anuttamaLogo}
          alt="Anuttama Enterprises LLP"
          className={`${imageSizeMap[size]} object-contain ${animated ? "animate-float" : ""}`}
          loading="eager"
          decoding="async"
        />
      </span>
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
