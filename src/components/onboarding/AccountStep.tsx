import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
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
  { id: 'name', label: 'Full Name', icon: User, placeholder: 'Your full name', type: 'text' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'you@example.com', type: 'email' },
  { id: 'phone', label: 'Mobile', icon: Phone, placeholder: '+91 98765 43210', type: 'tel' },
  { id: 'password', label: 'Password', icon: Lock, placeholder: 'Min 6 characters', type: 'password' },
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
      inputRef.current?.focus();
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

  return (
    <div className="space-y-5">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === currentField && "w-6 bg-gradient-to-r from-emerald-500 to-green-500",
              index < currentField && "w-1.5 bg-emerald-500",
              index > currentField && "w-1.5 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Current Field */}
      <div className="text-center animate-fade-in" key={currentField}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center mx-auto mb-3 shadow-md">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{currentStepData.label}</h2>
      </div>

      <div className="max-w-sm mx-auto space-y-3">
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type={getInputType()}
            placeholder={currentStepData.placeholder}
            value={getValue()}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 pl-10 pr-10 rounded-lg border-border/50 focus:border-emerald-500"
          />
          
          {currentStepData.id === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full h-10 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
        >
          {currentField === steps.length - 1 ? 'Continue to Setup' : 'Next'}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>

      {/* Completed fields */}
      {currentField > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {steps.slice(0, currentField).map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs"
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
