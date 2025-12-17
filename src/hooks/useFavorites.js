import { useQuery } from '@tanstack/react-query'
import { favoriteService } from '../services/favoriteService'

export function useFavoriteStatistics() {
  return useQuery({
    queryKey: ['favorites', 'statistics'],
    queryFn: favoriteService.getFavoriteStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTotalFavorites() {
  return useQuery({
    queryKey: ['favorites', 'total'],
    queryFn: favoriteService.getTotalFavorites,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useBuildingFavorites(buildingId) {
  return useQuery({
    queryKey: ['favorites', 'building', buildingId],
    queryFn: () => favoriteService.getBuildingFavorites(buildingId),
    enabled: !!buildingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useLocationStatistics() {
  return useQuery({
    queryKey: ['favorites', 'locations'],
    queryFn: favoriteService.getLocationStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useBuildingStatistics() {
  return useQuery({
    queryKey: ['favorites', 'buildings', 'statistics'],
    queryFn: favoriteService.getBuildingStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

