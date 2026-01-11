import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountStepProps {
  onComplete: (data: AccountData) => void;
}

interface AccountData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

const steps = [
  { id: 'name', label: 'Full Name', icon: User, placeholder: 'John Doe' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'you@example.com' },
  { id: 'phone', label: 'Phone Number', icon: Phone, placeholder: '+91 98765 43210' },
  { id: 'password', label: 'Password', icon: Lock, placeholder: '••••••••' },
];

export function AccountStep({ onComplete }: AccountStepProps) {
  const [currentField, setCurrentField] = useState(0);
  const [data, setData] = useState<AccountData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentField]);

  const currentStep = steps[currentField];
  const Icon = currentStep.icon;

  const getValue = () => {
    switch (currentStep.id) {
      case 'name': return data.fullName;
      case 'email': return data.email;
      case 'phone': return data.phone;
      case 'password': return data.password;
      default: return '';
    }
  };

  const setValue = (value: string) => {
    switch (currentStep.id) {
      case 'name': setData(prev => ({ ...prev, fullName: value })); break;
      case 'email': setData(prev => ({ ...prev, email: value })); break;
      case 'phone': setData(prev => ({ ...prev, phone: value })); break;
      case 'password': setData(prev => ({ ...prev, password: value })); break;
    }
  };

  const canProceed = () => {
    const value = getValue();
    if (!value.trim()) return false;
    
    if (currentStep.id === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    if (currentStep.id === 'password') {
      return value.length >= 6;
    }
    return true;
  };

  const handleNext = () => {
    if (currentField < steps.length - 1) {
      setCurrentField(prev => prev + 1);
    } else {
      onComplete(data);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed()) {
      handleNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentField && "w-8 bg-primary",
              index < currentField && "bg-emerald-500",
              index > currentField && "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Current Field */}
      <div className="text-center space-y-2 animate-fade-in" key={currentField}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-600/30">
          <Icon className="h-8 w-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground">What's your {currentStep.label.toLowerCase()}?</h2>
        <p className="text-muted-foreground">
          {currentStep.id === 'password' ? 'Choose a secure password (min 6 characters)' : 'We\'ll use this to personalize your experience'}
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="relative">
          <Input
            ref={inputRef}
            type={currentStep.id === 'password' && !showPassword ? 'password' : currentStep.id === 'email' ? 'email' : 'text'}
            placeholder={currentStep.placeholder}
            value={getValue()}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-14 text-lg text-center rounded-xl border-2 border-border/50 focus:border-primary transition-all pr-12"
          />
          
          {currentStep.id === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
        >
          {currentField === steps.length - 1 ? 'Create Account' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Completed fields preview */}
      {currentField > 0 && (
        <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
          {steps.slice(0, currentField).map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
