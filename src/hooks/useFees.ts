
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchool } from '@/hooks/useSchool';
import { useAuth } from '@/hooks/useAuth';

export interface FeeType {
  id: string;
  name: string;
  description?: string;
  amount: number;
  is_recurring?: boolean;
  school_id?: string;
}

export interface FeeRecord {
  id: string;
  student_id: string;
  fee_type_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_date?: string;
  payment_method?: string;
  notes?: string;
  school_id?: string;
  students?: {
    name: string;
    class: string;
  };
  fee_types?: {
    name: string;
  };
}

export interface CreateFeeRecordData {
  student_id: string;
  fee_type_id: string;
  amount: number;
  due_date: string;
  status: string;
  paid_date?: string | null;
  payment_method?: string | null;
  notes?: string | null;
}

export const useFees = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { userSchool } = useSchool();
  const { user } = useAuth();

  // Fetch fee types for the user's school
  const { data: feeTypes, isLoading: loadingFeeTypes } = useQuery({
    queryKey: ['feeTypes', userSchool?.id],
    queryFn: async () => {
      if (!userSchool?.id) {
        console.log('No user school found for fee types query');
        return [];
      }
      
      console.log('Fetching fee types for school:', userSchool.id);
      
      const { data, error } = await supabase
        .from('fee_types')
        .select('*')
        .eq('school_id', userSchool.id)
        .order('name');

      if (error) {
        console.error('Error fetching fee types:', error);
        throw error;
      }

      console.log('Fee types fetched:', data);
      return data as FeeType[];
    },
    enabled: !!userSchool?.id,
  });

  // Fetch fee records for the user's school
  const { data: feeRecords, isLoading: loadingFeeRecords } = useQuery({
    queryKey: ['feeRecords', userSchool?.id],
    queryFn: async () => {
      if (!userSchool?.id) return [];
      
      const { data, error } = await supabase
        .from('fee_records')
        .select(`
          *,
          students!inner(name, class),
          fee_types!inner(name)
        `)
        .eq('school_id', userSchool.id)
        .order('due_date', { ascending: false });

      if (error) {
        console.error('Error fetching fee records:', error);
        throw error;
      }

      return data as FeeRecord[];
    },
    enabled: !!userSchool?.id,
  });

  // Create fee type mutation
  const createFeeType = useMutation({
    mutationFn: async (feeTypeData: Omit<FeeType, 'id'>) => {
      if (!userSchool?.id) throw new Error('No school context');
      if (!user?.email) throw new Error('No user email found');
      
      const { data, error } = await supabase
        .from('fee_types')
        .insert([{ 
          ...feeTypeData, 
          school_id: userSchool.id,
          created_by: user.email,
          updated_by: user.email
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeTypes'] });
      toast({
        title: "Success",
        description: "Fee type created successfully!",
      });
    },
    onError: (error) => {
      console.error('Error creating fee type:', error);
      toast({
        title: "Error",
        description: "Failed to create fee type. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create fee record mutation
  const createFeeRecord = useMutation({
    mutationFn: async (feeRecordData: CreateFeeRecordData) => {
      if (!userSchool?.id) throw new Error('No school context');
      if (!user?.email) throw new Error('No user email found');
      
      const { data, error } = await supabase
        .from('fee_records')
        .insert([{ 
          ...feeRecordData, 
          school_id: userSchool.id,
          created_by: user.email,
          updated_by: user.email
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeRecords'] });
      toast({
        title: "Success",
        description: "Fee record created successfully!",
      });
    },
    onError: (error) => {
      console.error('Error creating fee record:', error);
      toast({
        title: "Error",
        description: "Failed to create fee record. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate fee records mutation
  const generateFeeRecords = useMutation({
    mutationFn: async ({ feeTypeId, dueDate, classFilter }: {
      feeTypeId: string;
      dueDate: string;
      classFilter?: string;
    }) => {
      const { data, error } = await supabase.rpc('generate_fee_records_for_students', {
        p_fee_type_id: feeTypeId,
        p_due_date: dueDate,
        p_class_filter: classFilter,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['feeRecords'] });
      toast({
        title: "Success",
        description: `${count} fee records generated successfully!`,
      });
    },
    onError: (error) => {
      console.error('Error generating fee records:', error);
      toast({
        title: "Error",
        description: "Failed to generate fee records. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark as paid mutation
  const markAsPaid = useMutation({
    mutationFn: async ({ id, paymentMethod }: { id: string; paymentMethod: string }) => {
      if (!userSchool?.id) throw new Error('No school context');
      if (!user?.email) throw new Error('No user email found');
      
      const { data, error } = await supabase
        .from('fee_records')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
          payment_method: paymentMethod,
          updated_by: user.email,
        })
        .eq('id', id)
        .eq('school_id', userSchool.id)
        .select()
        .single();

      if (error) throw error;

      // Also create a payment record
      await supabase
        .from('fee_payments')
        .insert([{
          fee_record_id: id,
          amount: data.amount,
          payment_method: paymentMethod,
          school_id: userSchool.id,
          created_by: user.email,
          updated_by: user.email,
        }]);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeRecords'] });
      toast({
        title: "Success",
        description: "Payment recorded successfully!",
      });
    },
    onError: (error) => {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    feeTypes,
    loadingFeeTypes,
    feeRecords,
    loadingFeeRecords,
    createFeeType,
    createFeeRecord,
    generateFeeRecords,
    markAsPaid,
  };
};
