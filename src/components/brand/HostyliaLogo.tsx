import hostyliaLogo from "@/assets/hostylia-logo.png";

interface HostyliaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  textColor?: "light" | "dark" | "auto";
  animated?: boolean;
}

const sizeMap = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
  xl: "h-16",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

export const HostyliaLogo = ({
  size = "md",
  className = "",
  showText = true,
  textColor = "auto",
  animated = false,
}: HostyliaLogoProps) => {
  const getTextColorClass = () => {
    switch (textColor) {
      case "light":
        return "text-white";
      case "dark":
        return "text-foreground";
      default:
        return "text-foreground dark:text-white";
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={hostyliaLogo}
        alt="Hostylia"
        className={`${sizeMap[size]} w-auto object-contain ${animated ? "animate-float" : ""}`}
      />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizeMap[size]} ${getTextColorClass()} tracking-tight`}>
            Hostylia
          </span>
          {size === "lg" || size === "xl" ? (
            <span className="text-xs text-muted-foreground -mt-0.5">
              Smart Residential Management
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};