import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pathService } from '../services/pathService'

export function usePaths() {
  return useQuery({
    queryKey: ['paths'],
    queryFn: pathService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePath(id) {
  return useQuery({
    queryKey: ['path', id],
    queryFn: () => pathService.getById(id),
    enabled: !!id,
  })
}

export function useCreatePath() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: pathService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paths'] })
    },
  })
}

export function useUpdatePath() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }) => pathService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['paths'] })
      queryClient.invalidateQueries({ queryKey: ['path', variables.id] })
    },
  })
}

export function useDeletePath() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: pathService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paths'] })
    },
  })
}
