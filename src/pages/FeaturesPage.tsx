import {
  Building2, QrCode, UtensilsCrossed, Receipt, Wrench, Settings2,
  Users, Bell, BarChart3, UserCheck, Check, Sparkles, Award,
  ArrowRight, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import dashboardImage from "@/assets/dashboard-illustration.png";
import hostelRoom from "@/assets/hostel-room.jpg";
import messCafeteria from "@/assets/mess-cafeteria.jpg";
import studentsImage from "@/assets/students-community.jpg";

const heroFeatures = [
  { icon: ClipboardList, text: "Internal use only" },
  { icon: Users, text: "Role-based access" },
  { icon: Building2, text: "Built for Anuttama operations" },
];

const mainFeatures = [
  {
    category: "Property & Room Records",
    icon: Building2,
    tagline: "Our internal record of every Anuttama hostel",
    description: "Manage rooms, beds, blocks and floors of every Anuttama-owned hostel with a visual interface. Track occupancy in real time.",
    items: ["Multi-hostel support", "Block & floor hierarchy", "Room & bed records", "Visual occupancy grid", "Asset tracking", "Condition logs"],
    image: hostelRoom,
    gradient: "from-primary to-blue-500",
  },
  {
    category: "Gate Pass Workflow",
    icon: QrCode,
    tagline: "Internal entry/exit handling for our residents",
    description: "Digitize the gate pass process for Anuttama residents using QR codes, approval workflows and parent notifications.",
    items: ["QR-based passes", "Approval workflows", "Real-time tracking", "Curfew alerts", "Parent notifications", "Security scanning"],
    image: studentsImage,
    gradient: "from-secondary to-emerald-500",
  },
  {
    category: "Mess Management",
    icon: UtensilsCrossed,
    tagline: "Run our in-house mess",
    description: "Plan menus, track nutrition, handle absences and calculate rebates for Anuttama mess operations.",
    items: ["Weekly menu planning", "Nutritional tracking", "Absence marking", "Rebate calculation", "Meal reports", "Vendor logs"],
    image: messCafeteria,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    category: "Hostel Fee & Billing",
    icon: Receipt,
    tagline: "Internal invoicing and payment tracking",
    description: "Generate hostel fee invoices, send reminders, accept multiple payment modes and track every transaction.",
    items: ["Automated invoicing", "Multiple payment modes", "Sub-metering", "Late fee handling", "Receipt generation", "Financial reports"],
    image: dashboardImage,
    gradient: "from-violet-500 to-purple-600",
  },
];

const additionalFeatures = [
  { icon: Wrench, title: "Maintenance Tracking", desc: "Photo-based tickets, assignment, SLA tracking, vendor coordination" },
  { icon: Settings2, title: "Hostel Policy Configuration", desc: "Per-hostel house rules, module activation, block-level settings" },
  { icon: Users, title: "Parent Visibility", desc: "Live updates, leave approvals, fee status and communication" },
  { icon: Bell, title: "Notifications", desc: "SMS, email, and in-app alerts for staff and residents" },
  { icon: BarChart3, title: "Operational Dashboard", desc: "Occupancy, fee collection, attendance and exportable reports" },
  { icon: UserCheck, title: "Attendance System", desc: "Daily attendance for residents and staff, with LOP tracking" },
];

const FeaturesPage = () => {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[hsl(222,47%,6%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={dashboardImage} alt="Operations dashboard" className="w-full h-full object-cover opacity-5" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,6%)] via-[hsl(222,47%,6%)]/90 to-[hsl(222,47%,6%)]" />
        </div>
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[80px]" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/80 text-sm font-medium mb-6 animate-slide-down stagger-1">
            <Settings2 className="h-4 w-4 text-secondary" />
            Internal Operations Capabilities
          </span>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 animate-slide-up stagger-2">
            How we run <span className="text-gradient">Anuttama Hostels</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8 animate-slide-up stagger-3">
            A consolidated workspace used by Anuttama staff to handle residents, fees, mess, gate passes and maintenance.
            This platform is developed exclusively for Anuttama-owned hostel operations and is not offered as a public software service.
          </p>

          <div className="flex flex-wrap justify-center gap-6 animate-slide-up stagger-4">
            {heroFeatures.map((feature) => (
              <div key={feature.text} className="flex items-center gap-2 text-white/70">
                <feature.icon className="h-5 w-5 text-secondary" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main capabilities */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-32">
            {mainFeatures.map((feature, index) => (
              <div key={feature.category} className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className={`${index % 2 === 1 ? "lg:order-2" : ""} animate-slide-up`}>
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>

                  <span className="text-secondary font-medium text-sm mb-2 block">{feature.tagline}</span>
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{feature.category}</h2>
                  <p className="text-muted-foreground text-lg mb-6">{feature.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {feature.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${index % 2 === 1 ? "lg:order-1" : ""} animate-slide-up`}>
                  <div className="relative group">
                    <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                      <img
                        src={feature.image}
                        alt={feature.category}
                        className="w-full h-80 lg:h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <Award className="h-4 w-4" />
              And more
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Additional <span className="text-gradient">Operational Tools</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {additionalFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-500 animate-slide-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary inline-flex mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal-use notice */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-primary to-secondary p-12 lg:p-16 text-center overflow-hidden">
            <Sparkles className="h-8 w-8 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Sign in to your Anuttama workspace
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Access is restricted to Anuttama Hostels staff and residents. This is not a public software product.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                Sign In <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesPage;
