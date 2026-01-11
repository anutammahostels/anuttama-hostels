import hostyliaLogo from "@/assets/hostylia-logo.png";
import hostyliaLogoDark from "@/assets/hostylia-logo-dark.png";

interface HostyliaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark" | "auto";
  animated?: boolean;
}

const sizeMap = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
  xl: "h-14",
};

export const HostyliaLogo = ({
  size = "md",
  className = "",
  showText = false,
  variant = "auto",
  animated = false,
}: HostyliaLogoProps) => {
  // Use dark logo on dark backgrounds, light logo on light backgrounds
  const logo = variant === "dark" ? hostyliaLogoDark : hostyliaLogo;

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logo}
        alt="Hostylia - Smart Residential Management"
        className={`${sizeMap[size]} w-auto object-contain ${animated ? "animate-float" : ""}`}
      />
    </div>
  );
};