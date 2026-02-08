import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeAPI, Employee } from '@/services/api';
import toast from 'react-hot-toast';

// React Query hook for employees - like Netflix/Amazon use!
export const useEmployees = () => {
  const queryClient = useQueryClient();

  // Fetch all employees with automatic caching
  const { data: employees = [], isLoading, error, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      console.log('🔄 [React Query] Fetching employees from API...');
      const data = await employeeAPI.getAll();
      // Filter out invalid employees
      const filtered = data.filter(emp => emp && emp._id && emp.name);
      console.log(`✅ [React Query] Fetched ${filtered.length} employees`);
      return filtered;
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // DO fetch on mount (IMPORTANT!)
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  // Create employee mutation
  const createMutation = useMutation({
    mutationFn: (newEmployee: Partial<Employee>) => employeeAPI.create(newEmployee),
    onMutate: async (newEmployee) => {
      console.log('🔄 [React Query] onMutate - Creating employee:', newEmployee);
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['employees'] });

      // Snapshot previous value
      const previousEmployees = queryClient.getQueryData<Employee[]>(['employees']);
      console.log('📸 [React Query] Snapshot taken, previous count:', previousEmployees?.length);

      // Optimistically update with temp ID
      const tempEmployee: Employee = {
        ...newEmployee,
        _id: `temp_${Date.now()}`,
        employeeId: newEmployee.employeeId || 'TEMP',
        name: newEmployee.name || '',
        email: newEmployee.email || '',
        department: newEmployee.department || '',
        designation: newEmployee.designation || '',
        salary: newEmployee.salary || 0,
        status: newEmployee.status || 'active',
      } as Employee;

      queryClient.setQueryData<Employee[]>(['employees'], (old = []) => {
        const updated = [...old, tempEmployee];
        console.log('✅ [React Query] Optimistic create applied, new count:', updated.length);
        return updated;
      });

      return { previousEmployees, tempEmployee };
    },
    onSuccess: (newEmployee, variables, context) => {
      console.log('✅ [React Query] onSuccess - Server returned new employee:', newEmployee);
      // Replace temp employee with real one
      queryClient.setQueryData<Employee[]>(['employees'], (old = []) =>
        old.map(emp => emp._id === context?.tempEmployee._id ? newEmployee : emp)
      );
      toast.success('Employee added successfully!', { duration: 3000, icon: '✅' });
      // DON'T invalidate - keep the optimistic update!
    },
    onError: (error: any, variables, context) => {
      console.error('❌ [React Query] onError - Rolling back create:', error);
      // Rollback on error
      if (context?.previousEmployees) {
        queryClient.setQueryData(['employees'], context.previousEmployees);
      }
      toast.error(error.message || 'Failed to add employee');
    },
  });

  // Update employee mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      employeeAPI.update(id, data),
    onMutate: async ({ id, data }) => {
      console.log('🔄 [React Query] onMutate - Optimistically updating employee:', id, data);
      await queryClient.cancelQueries({ queryKey: ['employees'] });

      const previousEmployees = queryClient.getQueryData<Employee[]>(['employees']);
      console.log('📸 [React Query] Snapshot taken, previous count:', previousEmployees?.length);

      // Optimistically update
      queryClient.setQueryData<Employee[]>(['employees'], (old = []) => {
        const updated = old.map(emp => emp._id === id ? { ...emp, ...data } : emp);
        console.log('✅ [React Query] Optimistic update applied, new count:', updated.length);
        return updated;
      });

      return { previousEmployees };
    },
    onSuccess: (updatedEmployee) => {
      console.log('✅ [React Query] onSuccess - Server returned:', updatedEmployee);
      // Update with server response
      queryClient.setQueryData<Employee[]>(['employees'], (old = []) => {
        const updated = old.map(emp => emp._id === updatedEmployee._id ? updatedEmployee : emp);
        console.log('✅ [React Query] Updated with server data, count:', updated.length);
        return updated;
      });
      toast.success('Employee updated successfully!', { duration: 3000, icon: '✅' });
      // DON'T invalidate - keep the optimistic update!
    },
    onError: (error: any, variables, context) => {
      console.error('❌ [React Query] onError - Rolling back:', error);
      if (context?.previousEmployees) {
        queryClient.setQueryData(['employees'], context.previousEmployees);
      }
      toast.error(error.message || 'Failed to update employee');
    },
  });

  // Delete employee mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeAPI.delete(id),
    onMutate: async (id) => {
      console.log('🔄 [React Query] onMutate - Deleting employee:', id);
      await queryClient.cancelQueries({ queryKey: ['employees'] });

      const previousEmployees = queryClient.getQueryData<Employee[]>(['employees']);
      console.log('📸 [React Query] Snapshot taken, previous count:', previousEmployees?.length);

      // Optimistically remove
      queryClient.setQueryData<Employee[]>(['employees'], (old = []) => {
        const filtered = old.filter(emp => emp._id !== id);
        console.log('✅ [React Query] Optimistic delete applied, new count:', filtered.length);
        return filtered;
      });

      return { previousEmployees };
    },
    onSuccess: () => {
      console.log('✅ [React Query] onSuccess - Employee deleted from server');
      toast.success('Employee deleted successfully!', { duration: 3000, icon: '✅' });
      // DON'T invalidate - keep the optimistic update!
    },
    onError: (error: any, variables, context) => {
      console.error('❌ [React Query] onError - Rolling back delete:', error);
      if (context?.previousEmployees) {
        queryClient.setQueryData(['employees'], context.previousEmployees);
      }
      toast.error(error.message || 'Failed to delete employee');
    },
  });

  return {
    employees,
    isLoading,
    error,
    refetch,
    createEmployee: createMutation.mutate,
    updateEmployee: updateMutation.mutate,
    deleteEmployee: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
