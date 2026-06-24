import { Button } from "@/components/ui/button";
import {
  ArrowRight, Building2, ClipboardList, Users, Sparkles, CheckCircle2,
  Receipt, UtensilsCrossed, QrCode, Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import hostelRoom from "@/assets/hostel-room.jpg";
import studentsImage from "@/assets/students-community.jpg";
import campusImage from "@/assets/campus-aerial.jpg";
import messCafeteria from "@/assets/mess-cafeteria.jpg";

const areas = [
  {
    icon: Users,
    title: "Resident Management",
    description: "Manage every resident at our hostel — admissions, room allocation, exits and records.",
    items: ["Admissions intake", "Room & bed allocation", "Resident records", "Exit & refund handling"],
    image: hostelRoom,
    gradient: "from-primary to-blue-500",
  },
  {
    icon: Receipt,
    title: "Hostel Fee Management",
    description: "Internal billing for hostel fees with discounts, payment tracking, refunds and receivables reports.",
    items: ["Fee invoices", "Discount handling", "Refund processing", "Receivables tracking"],
    image: campusImage,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: UtensilsCrossed,
    title: "Mess Management",
    description: "Plan menus, mark mess attendance and calculate rebates for our in-house mess operations.",
    items: ["Weekly menu", "Mess attendance", "Rebate calculation", "Vendor logs"],
    image: messCafeteria,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: QrCode,
    title: "Gate Pass Management",
    description: "Internal gate pass workflow for Anuttama residents with approvals and parent notifications.",
    items: ["QR-based passes", "Approval flow", "Curfew checks", "Parent alerts"],
    image: studentsImage,
    gradient: "from-secondary to-emerald-500",
  },
  {
    icon: Wrench,
    title: "Maintenance & Operations",
    description: "Track maintenance tickets, vendor work, complaints and day-to-day operational tasks.",
    items: ["Maintenance tickets", "Vendor coordination", "Complaint resolution", "Audit logs"],
    image: hostelRoom,
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: ClipboardList,
    title: "Attendance & Records",
    description: "Daily resident attendance, staff attendance and LOP tracking — all stored as internal records.",
    items: ["Resident attendance", "Staff attendance", "LOP tracking", "Reports"],
    image: campusImage,
    gradient: "from-violet-500 to-purple-600",
  },
];

const Solutions = () => {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={studentsImage} alt="Anuttama residents" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-[#29926A]/90 to-[hsl(222,47%,6%)]" />
        </div>
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[80px]" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/80 text-sm font-medium mb-6 animate-slide-down stagger-1">
              <Sparkles className="h-4 w-4 text-secondary" />
              Our Hostel
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 animate-slide-up stagger-2">
              Anuttama-owned <span className="text-gradient">Hostel Operations</span>
            </h1>
            <p className="text-lg text-white/60 mb-8 animate-slide-up stagger-3">
              We operate our own hostel. This internal platform consolidates how our staff manages residents,
              fees, mess, gate passes and maintenance at our hostel. It is not offered to third-party
              hostels or institutions.
            </p>
          </div>
        </div>
      </section>

      {/* Operational Areas */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-20">
            {areas.map((area, index) => (
              <div key={area.title} className="grid lg:grid-cols-2 gap-12 items-center">
                <div className={`${index % 2 === 1 ? "lg:order-2" : ""} animate-slide-up`}>
                  <div className={`inline-flex p-4 rounded-2xl bg-[#29926A] ${area.gradient} mb-6`}>
                    <area.icon className="h-8 w-8 text-white" />
                  </div>

                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{area.title}</h2>
                  <p className="text-muted-foreground text-lg mb-6">{area.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {area.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${index % 2 === 1 ? "lg:order-1" : ""} animate-slide-up`}>
                  <div className="relative group">
                    <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                      <img
                        src={area.image}
                        alt={area.title}
                        className="w-full h-80 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-[#29926A]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal-only notice */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Building2 className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              An internal platform — not a public software service
            </h2>
            <p className="text-muted-foreground text-base lg:text-lg">
              This workspace is developed and used exclusively by Anuttama Hostels for the hostel we own and operate.
              It is not sold, licensed or offered to other hostels, schools, co-living spaces, PGs or institutions.
            </p>
            <div className="mt-8">
              <Link to="/contact">
                <Button className="gap-2 bg-[#29926A]">
                  Contact Anuttama <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Solutions;
