import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { locationService } from '../services/locationService'

export function useLocations(buildingId) {
  return useQuery({
    queryKey: ['locations', buildingId],
    queryFn: () => locationService.getByBuilding(buildingId),
    enabled: !!buildingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAllLocations() {
  return useQuery({
    queryKey: ['locations', 'all'],
    queryFn: locationService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useLocation(id) {
  return useQuery({
    queryKey: ['location', id],
    queryFn: () => locationService.getById(id),
    enabled: !!id,
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: locationService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
      queryClient.invalidateQueries({ queryKey: ['building', data.building_id] })
    },
  })
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }) => locationService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
      if (variables.updates?.building_id || data?.building_id) {
        queryClient.invalidateQueries({ queryKey: ['building', data.building_id] })
      }
    },
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: locationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
    },
  })
}
