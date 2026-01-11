import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountStepProps {
  onComplete: (data: AccountData) => void;
}

export interface AccountData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

const steps = [
  { id: 'name', label: 'Full Name', icon: User, placeholder: 'Enter your full name', type: 'text' },
  { id: 'email', label: 'Email Address', icon: Mail, placeholder: 'you@example.com', type: 'email' },
  { id: 'phone', label: 'Mobile Number', icon: Phone, placeholder: '+91 98765 43210', type: 'tel' },
  { id: 'password', label: 'Create Password', icon: Lock, placeholder: 'Min 6 characters', type: 'password' },
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
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentField]);

  const currentStepData = steps[currentField];
  const Icon = currentStepData.icon;

  const getValue = () => {
    switch (currentStepData.id) {
      case 'name': return data.fullName;
      case 'email': return data.email;
      case 'phone': return data.phone;
      case 'password': return data.password;
      default: return '';
    }
  };

  const setValue = (value: string) => {
    switch (currentStepData.id) {
      case 'name': setData(prev => ({ ...prev, fullName: value })); break;
      case 'email': setData(prev => ({ ...prev, email: value })); break;
      case 'phone': setData(prev => ({ ...prev, phone: value })); break;
      case 'password': setData(prev => ({ ...prev, password: value })); break;
    }
  };

  const canProceed = () => {
    const value = getValue();
    if (!value.trim()) return false;
    
    if (currentStepData.id === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    if (currentStepData.id === 'password') {
      return value.length >= 6;
    }
    if (currentStepData.id === 'phone') {
      return value.replace(/\D/g, '').length >= 10;
    }
    return value.trim().length >= 2;
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
      e.preventDefault();
      handleNext();
    }
  };

  const getInputType = () => {
    if (currentStepData.id === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return currentStepData.type;
  };

  const getHelpText = () => {
    switch (currentStepData.id) {
      case 'name': return 'This will be used for your profile';
      case 'email': return 'We\'ll use this for account notifications';
      case 'phone': return 'For important updates and recovery';
      case 'password': return 'Choose a secure password (min 6 characters)';
      default: return '';
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
              "h-2 rounded-full transition-all duration-300",
              index === currentField && "w-8 bg-gradient-to-r from-emerald-600 to-green-600",
              index < currentField && "w-2 bg-emerald-500",
              index > currentField && "w-2 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Current Field */}
      <div className="text-center space-y-4 animate-fade-in" key={currentField}>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
          <Icon className="h-10 w-10 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-foreground">What's your {currentStepData.label.toLowerCase()}?</h2>
          <p className="text-muted-foreground mt-1">{getHelpText()}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="relative">
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type={getInputType()}
            placeholder={currentStepData.placeholder}
            value={getValue()}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-14 text-lg pl-12 rounded-xl border-2 border-border/50 focus:border-emerald-500 transition-all pr-12"
          />
          
          {currentStepData.id === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-lg font-semibold"
        >
          {currentField === steps.length - 1 ? (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Continue to Setup
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>

      {/* Completed fields preview */}
      {currentField > 0 && (
        <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
          {steps.slice(0, currentField).map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm border border-emerald-500/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step indicator */}
      <p className="text-center text-sm text-muted-foreground">
        Step {currentField + 1} of {steps.length}
      </p>
    </div>
  );
}
