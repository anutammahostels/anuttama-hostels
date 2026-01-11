
-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'tenant_admin', 'warden', 'student', 'parent', 'security_guard');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  owner_id UUID REFERENCES auth.users(id),
  total_capacity INTEGER DEFAULT 0,
  occupied_beds INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Blocks table
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  floor_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Floors table
CREATE TABLE public.floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES public.blocks(id) ON DELETE CASCADE NOT NULL,
  floor_number INTEGER NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;

-- Rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id UUID REFERENCES public.floors(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT NOT NULL,
  room_type TEXT DEFAULT 'shared' CHECK (room_type IN ('single', 'double', 'triple', 'quad', 'shared')),
  capacity INTEGER DEFAULT 1,
  occupied INTEGER DEFAULT 0,
  monthly_rent DECIMAL(10,2),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  amenities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Beds table
CREATE TABLE public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  bed_number TEXT NOT NULL,
  status TEXT DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'reserved', 'maintenance')),
  student_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;

-- Students extended info table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  roll_number TEXT UNIQUE,
  course TEXT,
  year INTEGER,
  department TEXT,
  parent_id UUID REFERENCES auth.users(id),
  emergency_contact TEXT,
  blood_group TEXT,
  date_of_birth DATE,
  admission_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Gate passes table
CREATE TABLE public.gate_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  pass_type TEXT NOT NULL CHECK (pass_type IN ('day_out', 'night_out', 'vacation', 'emergency')),
  reason TEXT NOT NULL,
  destination TEXT,
  out_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_return TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_return TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'checked_out', 'checked_in', 'expired')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  checked_out_by UUID REFERENCES auth.users(id),
  checked_out_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID REFERENCES auth.users(id),
  checked_in_at TIMESTAMP WITH TIME ZONE,
  qr_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gate_passes ENABLE ROW LEVEL SECURITY;

-- Mess management table
CREATE TABLE public.mess_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  meal_types TEXT[] DEFAULT ARRAY['breakfast', 'lunch', 'dinner'],
  monthly_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mess_plans ENABLE ROW LEVEL SECURITY;

-- Student mess subscriptions
CREATE TABLE public.mess_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.mess_plans(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mess_subscriptions ENABLE ROW LEVEL SECURITY;

-- Invoices/Billing table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  billing_month DATE NOT NULL,
  room_rent DECIMAL(10,2) DEFAULT 0,
  mess_charges DECIMAL(10,2) DEFAULT 0,
  electricity_charges DECIMAL(10,2) DEFAULT 0,
  other_charges DECIMAL(10,2) DEFAULT 0,
  discounts DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Maintenance tickets table
CREATE TABLE public.maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id),
  reported_by UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('electrical', 'plumbing', 'furniture', 'cleaning', 'pest_control', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;

-- Policy settings table for dynamic rules
CREATE TABLE public.policy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, setting_key)
);

ALTER TABLE public.policy_settings ENABLE ROW LEVEL SECURITY;

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  );
  RETURN new;
END;
$$;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON public.maintenance_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_policy_settings_updated_at BEFORE UPDATE ON public.policy_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Profiles: Users can read all profiles, update own
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User Roles: Only admins can manage, users can view own
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin'));

-- Properties: Admins and owners can manage
CREATE POLICY "Authenticated users can view properties" ON public.properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage properties" ON public.properties FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'tenant_admin') OR 
  owner_id = auth.uid()
);

-- Blocks, Floors, Rooms, Beds: Follow property access
CREATE POLICY "Authenticated users can view blocks" ON public.blocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage blocks" ON public.blocks FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'warden')
);

CREATE POLICY "Authenticated users can view floors" ON public.floors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage floors" ON public.floors FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'warden')
);

CREATE POLICY "Authenticated users can view rooms" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage rooms" ON public.rooms FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'warden')
);

CREATE POLICY "Authenticated users can view beds" ON public.beds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage beds" ON public.beds FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'warden')
);

-- Students: Admins/wardens manage, students/parents view own
CREATE POLICY "Admins can view all students" ON public.students FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'tenant_admin') OR 
  public.has_role(auth.uid(), 'warden') OR
  user_id = auth.uid() OR
  parent_id = auth.uid()
);
CREATE POLICY "Admins can manage students" ON public.students FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'warden')
);

-- Gate Passes: Students create, wardens approve, guards check
CREATE POLICY "View own or managed gate passes" ON public.gate_passes FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'tenant_admin') OR 
  public.has_role(auth.uid(), 'warden') OR
  public.has_role(auth.uid(), 'security_guard') OR
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() OR parent_id = auth.uid())
);
CREATE POLICY "Students can create gate passes" ON public.gate_passes FOR INSERT TO authenticated WITH CHECK (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "Wardens can manage gate passes" ON public.gate_passes FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'tenant_admin') OR 
  public.has_role(auth.uid(), 'warden') OR
  public.has_role(auth.uid(), 'security_guard')
);

-- Mess Plans & Subscriptions
CREATE POLICY "View mess plans" ON public.mess_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage mess plans" ON public.mess_plans FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin')
);

CREATE POLICY "View own mess subscriptions" ON public.mess_subscriptions FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'tenant_admin') OR 
  public.has_role(auth.uid(), 'warden') OR
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() OR parent_id = auth.uid())
);
CREATE POLICY "Admins manage mess subscriptions" ON public.mess_subscriptions FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'warden')
);

-- Invoices
CREATE POLICY "View own invoices" ON public.invoices FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'tenant_admin') OR 
  public.has_role(auth.uid(), 'warden') OR
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() OR parent_id = auth.uid())
);
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin')
);

-- Maintenance Tickets
CREATE POLICY "View maintenance tickets" ON public.maintenance_tickets FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'tenant_admin') OR 
  public.has_role(auth.uid(), 'warden') OR
  reported_by = auth.uid()
);
CREATE POLICY "Create maintenance tickets" ON public.maintenance_tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins manage maintenance tickets" ON public.maintenance_tickets FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'warden')
);

-- Policy Settings
CREATE POLICY "View policy settings" ON public.policy_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage policy settings" ON public.policy_settings FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'tenant_admin')
);
