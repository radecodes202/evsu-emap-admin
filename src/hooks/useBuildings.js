import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buildingService } from '../services/buildingService'

export function useBuildings() {
  return useQuery({
    queryKey: ['buildings'],
    queryFn: buildingService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useBuilding(id) {
  return useQuery({
    queryKey: ['building', id],
    queryFn: () => buildingService.getById(id),
    enabled: !!id,
  })
}

export function useCreateBuilding() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: buildingService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
  })
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }) => buildingService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
      queryClient.invalidateQueries({ queryKey: ['building', variables.id] })
    },
  })
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: buildingService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
  })
}
