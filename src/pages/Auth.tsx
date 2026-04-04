import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, ArrowRight, Sparkles, Building2, Users, Clock, Shield, Star, GraduationCap, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { HostyliaLogo } from '@/components/brand/HostyliaLogo';
import heroBuilding from '@/assets/hero-building.jpg';
import { cn } from '@/lib/utils';

const emailSchema = z.string().email('Please enter a valid email address');
const enrollmentSchema = z.string().min(1, 'Please enter your enrollment number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const adminFeatures = [
  { icon: Building2, text: 'Manage unlimited properties' },
  { icon: Users, text: 'All stakeholder dashboards' },
  { icon: Clock, text: 'Save 20+ hours weekly' },
  { icon: Shield, text: 'Enterprise-grade security' },
];

const studentFeatures = [
  { icon: GraduationCap, text: 'View your hostel details' },
  { icon: Clock, text: 'Request gate passes instantly' },
  { icon: Shield, text: 'Track invoices & payments' },
  { icon: Users, text: 'Submit complaints & requests' },
];

type LoginMode = 'select' | 'admin' | 'student';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; enrollment?: string; password?: string }>({});
  const [mode, setMode] = useState<LoginMode>('select');
  
  const { signIn, user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && role) {
      if (role === 'super_admin') {
        navigate('/superadmin');
      } else if (role === 'student') {
        navigate('/student');
      } else if (role === 'accountant') {
        navigate('/dashboard/accounting');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, role, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; enrollment?: string; password?: string } = {};
    if (isStudent) {
      const enrollResult = enrollmentSchema.safeParse(enrollmentNumber);
      if (!enrollResult.success) newErrors.enrollment = enrollResult.error.errors[0].message;
    } else {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    // For students, convert enrollment number to the generated email format
    const loginEmail = isStudent 
      ? `${enrollmentNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}@anuttama.student`
      : email;
    const { error } = await signIn(loginEmail, password);
    setIsLoading(false);
    if (error) {
      toast({ title: 'Sign in failed', description: error.message === 'Invalid login credentials' ? (isStudent ? 'Invalid enrollment number or password.' : 'Invalid email or password.') : error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back!', description: 'You have successfully signed in.' });
    }
  };

  const isAdmin = mode === 'admin';
  const isStudent = mode === 'student';
  const features = isAdmin ? adminFeatures : studentFeatures;

  const leftPanelGradient = isStudent
    ? "from-[hsl(217,91%,8%)]/95 via-[hsl(217,91%,12%)]/90 to-[hsl(217,91%,25%)]/80"
    : "from-[hsl(222,47%,6%)]/95 via-[hsl(222,47%,8%)]/90 to-[hsl(152,55%,20%)]/80";

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroBuilding} alt="Modern hostel" className="absolute inset-0 w-full h-full object-cover" />
        <div className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-700", leftPanelGradient)} />
        
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <Link to="/"><HostyliaLogo variant="dark" size="lg" /></Link>
          
          <div className="space-y-8">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20",
              isStudent ? "bg-blue-500/20" : "bg-white/10"
            )}>
              {isStudent ? <GraduationCap className="h-4 w-4 text-blue-300" /> : <Sparkles className="h-4 w-4 text-secondary" />}
              <span className="text-sm text-white/80">
                {mode === 'select' ? 'Smart Residential Management' : isStudent ? 'Student Portal' : 'Admin Dashboard'}
              </span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              {mode === 'select' ? (
                <>Transform Your<br /><span className="text-gradient">Property Operations</span></>
              ) : isStudent ? (
                <>Your Hostel<br /><span className="text-blue-300">At Your Fingertips</span></>
              ) : (
                <>Manage Your<br /><span className="text-gradient">Properties Smartly</span></>
              )}
            </h1>
            {mode !== 'select' && (
              <div className="space-y-3">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/80 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className={cn("p-2 rounded-lg", isStudent ? "bg-blue-500/20" : "bg-secondary/20")}>
                      <f.icon className={cn("h-4 w-4", isStudent ? "text-blue-300" : "text-secondary")} />
                    </div>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            )}
            {mode === 'select' && (
              <div className="flex gap-6 pt-4">
                {[{ value: '500+', label: 'Properties' }, { value: '50K+', label: 'Students' }, { value: '4.9/5', label: 'Rating' }].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-gradient">{s.value}</p>
                    <p className="text-sm text-white/50">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
            <span className="text-white/60 text-sm ml-2">Trusted by 500+ properties</span>
          </div>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="lg:hidden flex justify-center"><Link to="/"><HostyliaLogo size="lg" /></Link></div>
          
          {/* Role Selection Screen */}
          {mode === 'select' && (
            <>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
                <p className="text-muted-foreground">Choose how you'd like to sign in</p>
              </div>

              <div className="space-y-4">
                {/* Admin Card */}
                <button
                  onClick={() => setMode('admin')}
                  className="w-full text-left group"
                >
                  <div className="bg-card rounded-2xl border-2 border-border/50 shadow-md p-6 transition-all duration-300 hover:border-secondary hover:shadow-xl hover:shadow-secondary/10 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 group-hover:from-secondary/30 group-hover:to-secondary/10 transition-colors">
                        <Building2 className="h-7 w-7 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">Hostel Admin</h3>
                        <p className="text-sm text-muted-foreground">Manage properties, students & operations</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                    </div>
                  </div>
                </button>

                {/* Student Card */}
                <button
                  onClick={() => setMode('student')}
                  className="w-full text-left group"
                >
                  <div className="bg-card rounded-2xl border-2 border-border/50 shadow-md p-6 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                        <GraduationCap className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">Student</h3>
                        <p className="text-sm text-muted-foreground">Access your hostel portal & services</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Sign up CTA for admins */}
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">New hostel admin?</p>
                <Link to="/onboarding">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 rounded-xl gap-2 border-2 hover:bg-secondary/10 hover:border-secondary/50"
                  >
                    <Sparkles className="h-4 w-4 text-secondary" />
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">7 days free • No credit card required</p>
              </div>
            </>
          )}

          {/* Login Form */}
          {mode !== 'select' && (
            <>
              <div className="space-y-2">
                <button 
                  onClick={() => { setMode('select'); setEmail(''); setEnrollmentNumber(''); setPassword(''); setErrors({}); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <div className="text-center space-y-2">
                  <div className={cn(
                    "inline-flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-2",
                    isStudent ? "bg-primary/10" : "bg-secondary/10"
                  )}>
                    {isStudent 
                      ? <GraduationCap className="h-7 w-7 text-primary" />
                      : <Building2 className="h-7 w-7 text-secondary" />
                    }
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {isStudent ? 'Student Login' : 'Admin Login'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {isStudent 
                      ? 'Sign in with the credentials provided by your hostel admin'
                      : 'Sign in to manage your properties and operations'
                    }
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border/50 shadow-xl p-6 sm:p-8">
                <form onSubmit={handleSignIn} className="space-y-5">
                  {isStudent ? (
                    <div className="space-y-2">
                      <Label>Enrollment Number</Label>
                      <div className="relative group">
                        <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="text" 
                          placeholder="e.g. CS2026001" 
                          value={enrollmentNumber} 
                          onChange={(e) => setEnrollmentNumber(e.target.value)} 
                          className="pl-10 h-12 rounded-xl" 
                          required 
                          autoFocus
                        />
                      </div>
                      {errors.enrollment && <p className="text-sm text-destructive">{errors.enrollment}</p>}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="email" 
                          placeholder="you@example.com" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          className="pl-10 h-12 rounded-xl" 
                          required 
                          autoFocus
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  )}
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="pl-10 h-12 rounded-xl" 
                        required 
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <Button 
                    type="submit" 
                    className={cn(
                      "w-full h-12 rounded-xl text-white",
                      isStudent 
                        ? "bg-gradient-to-r from-primary to-blue-500" 
                        : "bg-gradient-to-r from-primary to-secondary"
                    )}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                    ) : (
                      <>Sign In as {isStudent ? 'Student' : 'Admin'}<ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>

                {isStudent && (
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Your login credentials are provided by your hostel administrator. Contact them if you don't have access.
                  </p>
                )}
              </div>

              {isAdmin && (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">Don't have an account?</p>
                  <Link to="/onboarding">
                    <Button 
                      variant="outline" 
                      className="w-full h-12 rounded-xl gap-2 border-2 hover:bg-secondary/10 hover:border-secondary/50"
                    >
                      <Sparkles className="h-4 w-4 text-secondary" />
                      Start Free Trial
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
          
          <p className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
