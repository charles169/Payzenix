import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanAPI, Loan } from '@/services/api';
import toast from 'react-hot-toast';

// React Query hook for loans - production-grade data management!
export const useLoans = () => {
  const queryClient = useQueryClient();

  // Fetch all loans with automatic caching
  const { data: loans = [], isLoading, error, refetch } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      console.log('🔄 [React Query] Fetching loans from API...');
      const data = await loanAPI.getAll();
      // Filter out invalid loans
      const filtered = data.filter(loan => loan && loan._id);
      console.log(`✅ [React Query] Fetched ${filtered.length} loans`);
      return filtered;
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // DO fetch on mount (IMPORTANT!)
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  // Create loan mutation
  const createMutation = useMutation({
    mutationFn: (newLoan: Partial<Loan>) => loanAPI.create(newLoan),
    onMutate: async (newLoan) => {
      console.log('🔄 [React Query] onMutate - Creating loan:', newLoan);
      await queryClient.cancelQueries({ queryKey: ['loans'] });

      const previousLoans = queryClient.getQueryData<Loan[]>(['loans']);
      console.log('📸 [React Query] Snapshot taken, previous count:', previousLoans?.length);

      // Optimistically add with temp ID
      const tempLoan: Loan = {
        ...newLoan,
        _id: `temp_${Date.now()}`,
        paidAmount: 0,
        status: 'pending',
      } as Loan;

      queryClient.setQueryData<Loan[]>(['loans'], (old = []) => {
        const updated = [...old, tempLoan];
        console.log('✅ [React Query] Optimistic create applied, new count:', updated.length);
        return updated;
      });

      return { previousLoans, tempLoan };
    },
    onSuccess: (newLoan, variables, context) => {
      console.log('✅ [React Query] onSuccess - Server returned new loan:', newLoan);
      // Replace temp with real loan
      queryClient.setQueryData<Loan[]>(['loans'], (old = []) =>
        old.map(loan => loan._id === context?.tempLoan._id ? newLoan : loan)
      );
      toast.success('Loan created successfully!', { duration: 3000, icon: '✅' });
      // DON'T invalidate - keep the optimistic update!
    },
    onError: (error: any, variables, context) => {
      console.error('❌ [React Query] onError - Rolling back create:', error);
      if (context?.previousLoans) {
        queryClient.setQueryData(['loans'], context.previousLoans);
      }
      toast.error(error.message || 'Failed to create loan');
    },
  });

  // Approve/Reject loan mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      loanAPI.approve(id, status),
    onMutate: async ({ id, status }) => {
      console.log('🔄 [React Query] onMutate - Approving loan:', id, status);
      await queryClient.cancelQueries({ queryKey: ['loans'] });

      const previousLoans = queryClient.getQueryData<Loan[]>(['loans']);
      console.log('📸 [React Query] Snapshot taken, previous count:', previousLoans?.length);

      // Optimistically update status
      queryClient.setQueryData<Loan[]>(['loans'], (old = []) => {
        const updated = old.map(loan => loan._id === id ? { ...loan, status } : loan);
        console.log('✅ [React Query] Optimistic update applied, new count:', updated.length);
        return updated;
      });

      return { previousLoans };
    },
    onSuccess: (_, { status }) => {
      console.log('✅ [React Query] onSuccess - Loan approved');
      toast.success(`Loan ${status} successfully!`, { duration: 4000, icon: '✅' });
      // DON'T invalidate - keep the optimistic update!
    },
    onError: (error: any, variables, context) => {
      console.error('❌ [React Query] onError - Rolling back:', error);
      if (context?.previousLoans) {
        queryClient.setQueryData(['loans'], context.previousLoans);
      }
      toast.error(error.message || 'Failed to update loan status');
    },
  });

  return {
    loans,
    isLoading,
    error,
    refetch,
    createLoan: createMutation.mutate,
    approveLoan: approveMutation.mutate,
    isCreating: createMutation.isPending,
    isApproving: approveMutation.isPending,
  };
};
