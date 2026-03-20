export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          property_id: string
        }
        Insert: {
          account_type: Database["public"]["Enums"]["account_type"]
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          property_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      admissions: {
        Row: {
          address: string | null
          admission_date: string | null
          blood_group: string | null
          city: string | null
          course: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          notes: string | null
          parent_address: string | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          parent_relationship: string | null
          phone: string | null
          pincode: string | null
          property_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          roll_number: string | null
          room_type_preference: string | null
          state: string | null
          status: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          blood_group?: string | null
          city?: string | null
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          notes?: string | null
          parent_address?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_relationship?: string | null
          phone?: string | null
          pincode?: string | null
          property_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          roll_number?: string | null
          room_type_preference?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          blood_group?: string | null
          city?: string | null
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          notes?: string | null
          parent_address?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_relationship?: string | null
          phone?: string | null
          pincode?: string | null
          property_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          roll_number?: string | null
          room_type_preference?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "admissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          marked_by: string | null
          notes: string | null
          property_id: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          property_id: string
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          property_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          property_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          property_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          property_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: string
          created_at: string
          id: string
          room_id: string
          status: string | null
          student_id: string | null
        }
        Insert: {
          bed_number: string
          created_at?: string
          id?: string
          room_id: string
          status?: string | null
          student_id?: string | null
        }
        Update: {
          bed_number?: string
          created_at?: string
          id?: string
          room_id?: string
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beds_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          created_at: string
          floor_count: number | null
          id: string
          name: string
          property_id: string
        }
        Insert: {
          created_at?: string
          floor_count?: number | null
          id?: string
          name: string
          property_id: string
        }
        Update: {
          created_at?: string
          floor_count?: number | null
          id?: string
          name?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          property_id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          student_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          property_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          student_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          property_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          student_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          bank_account: string | null
          bank_name: string | null
          created_at: string
          date_of_joining: string | null
          department: string | null
          designation: string
          email: string | null
          esi_number: string | null
          full_name: string
          id: string
          phone: string | null
          property_id: string
          salary_amount: number
          status: string | null
          uan_number: string | null
          updated_at: string
        }
        Insert: {
          bank_account?: string | null
          bank_name?: string | null
          created_at?: string
          date_of_joining?: string | null
          department?: string | null
          designation: string
          email?: string | null
          esi_number?: string | null
          full_name: string
          id?: string
          phone?: string | null
          property_id: string
          salary_amount?: number
          status?: string | null
          uan_number?: string | null
          updated_at?: string
        }
        Update: {
          bank_account?: string | null
          bank_name?: string | null
          created_at?: string
          date_of_joining?: string | null
          department?: string | null
          designation?: string
          email?: string | null
          esi_number?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          property_id?: string
          salary_amount?: number
          status?: string | null
          uan_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      floors: {
        Row: {
          block_id: string
          created_at: string
          floor_number: number
          id: string
          name: string | null
        }
        Insert: {
          block_id: string
          created_at?: string
          floor_number: number
          id?: string
          name?: string | null
        }
        Update: {
          block_id?: string
          created_at?: string
          floor_number?: number
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "floors_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_passes: {
        Row: {
          actual_return: string | null
          approved_at: string | null
          approved_by: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          checked_out_at: string | null
          checked_out_by: string | null
          created_at: string
          destination: string | null
          expected_return: string
          id: string
          notes: string | null
          out_date: string
          pass_type: string
          qr_code: string | null
          reason: string
          status: string | null
          student_id: string
        }
        Insert: {
          actual_return?: string | null
          approved_at?: string | null
          approved_by?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_out_at?: string | null
          checked_out_by?: string | null
          created_at?: string
          destination?: string | null
          expected_return: string
          id?: string
          notes?: string | null
          out_date: string
          pass_type: string
          qr_code?: string | null
          reason: string
          status?: string | null
          student_id: string
        }
        Update: {
          actual_return?: string | null
          approved_at?: string | null
          approved_by?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_out_at?: string | null
          checked_out_by?: string | null
          created_at?: string
          destination?: string | null
          expected_return?: string
          id?: string
          notes?: string | null
          out_date?: string
          pass_type?: string
          qr_code?: string | null
          reason?: string
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gate_passes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          billing_month: string
          created_at: string
          discounts: number | null
          due_date: string
          electricity_charges: number | null
          id: string
          invoice_number: string
          mess_charges: number | null
          notes: string | null
          other_charges: number | null
          paid_amount: number | null
          payment_date: string | null
          payment_method: string | null
          room_rent: number | null
          status: string | null
          student_id: string
          total_amount: number
        }
        Insert: {
          billing_month: string
          created_at?: string
          discounts?: number | null
          due_date: string
          electricity_charges?: number | null
          id?: string
          invoice_number: string
          mess_charges?: number | null
          notes?: string | null
          other_charges?: number | null
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          room_rent?: number | null
          status?: string | null
          student_id: string
          total_amount: number
        }
        Update: {
          billing_month?: string
          created_at?: string
          discounts?: number | null
          due_date?: string
          electricity_charges?: number | null
          id?: string
          invoice_number?: string
          mess_charges?: number | null
          notes?: string | null
          other_charges?: number | null
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          room_rent?: number | null
          status?: string | null
          student_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          credit_account_id: string
          date: string
          debit_account_id: string
          description: string
          entry_number: string
          id: string
          property_id: string
          reference: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          credit_account_id: string
          date?: string
          debit_account_id: string
          description: string
          entry_number: string
          id?: string
          property_id: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          credit_account_id?: string
          date?: string
          debit_account_id?: string
          description?: string
          entry_number?: string
          id?: string
          property_id?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_credit_account_id_fkey"
            columns: ["credit_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_debit_account_id_fkey"
            columns: ["debit_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          priority: string | null
          property_id: string
          reported_by: string
          resolved_at: string | null
          room_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          property_id: string
          reported_by: string
          resolved_at?: string | null
          room_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          property_id?: string
          reported_by?: string
          resolved_at?: string | null
          room_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tickets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tickets_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      mess_plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          meal_types: string[] | null
          monthly_price: number
          name: string
          property_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          meal_types?: string[] | null
          monthly_price: number
          name: string
          property_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          meal_types?: string[] | null
          monthly_price?: number
          name?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mess_plans_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      mess_subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          plan_id: string
          start_date: string
          status: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          plan_id: string
          start_date: string
          status?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          plan_id?: string
          start_date?: string
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mess_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "mess_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mess_subscriptions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string
          property_id: string
          target_roles: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string
          property_id: string
          target_roles?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string
          property_id?: string
          target_roles?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          settings: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          settings?: Json | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          settings?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payroll_records: {
        Row: {
          allowances: number | null
          basic_salary: number
          created_at: string
          da: number | null
          deductions: number | null
          employee_id: string
          esi_employee: number | null
          esi_employer: number | null
          generated_at: string | null
          gross_salary: number | null
          hra: number | null
          id: string
          medical_allowance: number | null
          month: string
          net_salary: number
          notes: string | null
          other_allowance: number | null
          other_deduction: number | null
          pf_employee: number | null
          pf_employer: number | null
          professional_tax: number | null
          property_id: string
          status: string | null
          tds: number | null
          travel_allowance: number | null
        }
        Insert: {
          allowances?: number | null
          basic_salary?: number
          created_at?: string
          da?: number | null
          deductions?: number | null
          employee_id: string
          esi_employee?: number | null
          esi_employer?: number | null
          generated_at?: string | null
          gross_salary?: number | null
          hra?: number | null
          id?: string
          medical_allowance?: number | null
          month: string
          net_salary?: number
          notes?: string | null
          other_allowance?: number | null
          other_deduction?: number | null
          pf_employee?: number | null
          pf_employer?: number | null
          professional_tax?: number | null
          property_id: string
          status?: string | null
          tds?: number | null
          travel_allowance?: number | null
        }
        Update: {
          allowances?: number | null
          basic_salary?: number
          created_at?: string
          da?: number | null
          deductions?: number | null
          employee_id?: string
          esi_employee?: number | null
          esi_employer?: number | null
          generated_at?: string | null
          gross_salary?: number | null
          hra?: number | null
          id?: string
          medical_allowance?: number | null
          month?: string
          net_salary?: number
          notes?: string | null
          other_allowance?: number | null
          other_deduction?: number | null
          pf_employee?: number | null
          pf_employer?: number | null
          professional_tax?: number | null
          property_id?: string
          status?: string | null
          tds?: number | null
          travel_allowance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          property_id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          property_id: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          property_id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_settings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          name: string
          occupied_beds: number | null
          organization_id: string | null
          owner_id: string | null
          pincode: string | null
          state: string | null
          status: string | null
          total_capacity: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
          occupied_beds?: number | null
          organization_id?: string | null
          owner_id?: string | null
          pincode?: string | null
          state?: string | null
          status?: string | null
          total_capacity?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          occupied_beds?: number | null
          organization_id?: string | null
          owner_id?: string | null
          pincode?: string | null
          state?: string | null
          status?: string | null
          total_capacity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number | null
          created_at: string
          floor_id: string
          id: string
          monthly_rent: number | null
          occupied: number | null
          room_number: string
          room_type: string | null
          status: string | null
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string
          floor_id: string
          id?: string
          monthly_rent?: number | null
          occupied?: number | null
          room_number: string
          room_type?: string | null
          status?: string | null
        }
        Update: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string
          floor_id?: string
          id?: string
          monthly_rent?: number | null
          occupied?: number | null
          room_number?: string
          room_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          admission_date: string | null
          blood_group: string | null
          course: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          emergency_contact: string | null
          id: string
          parent_id: string | null
          roll_number: string | null
          status: string | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          admission_date?: string | null
          blood_group?: string | null
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          emergency_contact?: string | null
          id?: string
          parent_id?: string | null
          roll_number?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          admission_date?: string | null
          blood_group?: string | null
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          emergency_contact?: string | null
          id?: string
          parent_id?: string | null
          roll_number?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string | null
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          id: string
          payment_mode: string | null
          property_id: string
          reference_number: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          account_id: string
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          payment_mode?: string | null
          property_id: string
          reference_number?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          payment_mode?: string | null
          property_id?: string
          reference_number?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "income" | "expense" | "asset" | "liability"
      app_role:
        | "super_admin"
        | "tenant_admin"
        | "warden"
        | "student"
        | "parent"
        | "security_guard"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["income", "expense", "asset", "liability"],
      app_role: [
        "super_admin",
        "tenant_admin",
        "warden",
        "student",
        "parent",
        "security_guard",
      ],
    },
  },
} as const
