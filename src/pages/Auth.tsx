import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, ArrowRight, Sparkles, Building2, Users, Clock, Shield, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { HostyliaLogo } from '@/components/brand/HostyliaLogo';
import heroBuilding from '@/assets/hero-building.jpg';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const features = [
  { icon: Building2, text: 'Manage unlimited properties' },
  { icon: Users, text: 'All stakeholder dashboards' },
  { icon: Clock, text: 'Save 20+ hours weekly' },
  { icon: Shield, text: 'Enterprise-grade security' },
];

const stats = [
  { value: '500+', label: 'Properties' },
  { value: '50K+', label: 'Students' },
  { value: '4.9/5', label: 'Rating' },
];

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast({ title: 'Sign in failed', description: error.message === 'Invalid login credentials' ? 'Invalid email or password.' : error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back!', description: 'You have successfully signed in.' });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroBuilding} alt="Modern hostel" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222,47%,6%)]/95 via-[hsl(222,47%,8%)]/90 to-[hsl(152,55%,20%)]/80" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <Link to="/"><HostyliaLogo variant="dark" size="lg" /></Link>
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="text-sm text-white/80">Smart Residential Management</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Transform Your<br /><span className="text-gradient">Property Operations</span>
            </h1>
            <div className="space-y-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="p-2 rounded-lg bg-secondary/20"><f.icon className="h-4 w-4 text-secondary" /></div>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-6 pt-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-gradient">{s.value}</p>
                  <p className="text-sm text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
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
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 shadow-xl p-6 sm:p-8">
            <form onSubmit={handleSignIn} className="space-y-5">
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
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                ) : (
                  <>Sign In<ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>
          </div>

          {/* Sign up CTA */}
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Don't have an account?</p>
            <Link to="/onboarding">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl gap-2 border-2 hover:bg-emerald-500/10 hover:border-emerald-500/50"
              >
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              7 days free • No credit card required
            </p>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
