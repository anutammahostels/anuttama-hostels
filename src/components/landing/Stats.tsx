const stats = [
  { value: "500+", label: "Hostels Managed" },
  { value: "50K+", label: "Students Served" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "4.9/5", label: "Customer Rating" },
];

export const Stats = () => {
  return (
    <section className="py-16 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
