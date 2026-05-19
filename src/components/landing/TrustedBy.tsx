import { Building2 } from "lucide-react";

// Internal note: TrustedBy is intentionally not used on the public site
// because Anuttama Hostels does not sell this platform to third parties.
// This minimal placeholder is kept to avoid breaking any imports.
export const TrustedBy = () => {
  return (
    <section className="py-12 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider flex items-center justify-center gap-2">
          <Building2 className="h-4 w-4" />
          An internal platform of Anuttama Hostels
        </p>
      </div>
    </section>
  );
};
