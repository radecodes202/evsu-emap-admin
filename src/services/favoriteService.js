import { supabase } from '../lib/supabase'

export const favoriteService = {
  // Get favorite statistics - most favorited buildings
  async getFavoriteStatistics() {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        building_id,
        buildings!inner (
          id,
          name,
          code,
          category,
          latitude,
          longitude
        )
      `)
    
    if (error) throw error
    
    // Count favorites per building
    const favoriteCounts = {}
    data.forEach((fav) => {
      if (fav.buildings) {
        const buildingId = fav.building_id
        if (!favoriteCounts[buildingId]) {
          favoriteCounts[buildingId] = {
            building: fav.buildings,
            count: 0,
          }
        }
        favoriteCounts[buildingId].count += 1
      }
    })
    
    // Convert to array and sort by count
    return Object.values(favoriteCounts)
      .sort((a, b) => b.count - a.count)
  },

  // Get total favorites count
  async getTotalFavorites() {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  },

  // Get favorites for a specific building
  async getBuildingFavorites(buildingId) {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', buildingId)
    
    if (error) throw error
    return count || 0
  },

  // Get most popular/accessed locations/rooms from audit logs
  // This uses audit logs as a proxy for "favorites" since favorites table only supports buildings
  async getLocationStatistics() {
    // Get all audit logs for locations
    const { data: locationLogs, error } = await supabase
      .from('audit_logs')
      .select('entity_id, entity_type, description')
      .eq('entity_type', 'location')
      .order('created_at', { ascending: false })
      .limit(1000) // Get recent activity
    
    if (error) throw error
    
    // Get unique location IDs and their access counts
    const locationCounts = {}
    locationLogs.forEach((log) => {
      if (log.entity_id) {
        locationCounts[log.entity_id] = (locationCounts[log.entity_id] || 0) + 1
      }
    })
    
    // Get location details for the most accessed locations
    const topLocationIds = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Top 20 most accessed
      .map(([id]) => id)
    
    if (topLocationIds.length === 0) {
      return []
    }
    
    // Fetch location details
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select(`
        id,
        name,
        room_number,
        type,
        floor,
        building:buildings(id, name, code)
      `)
      .in('id', topLocationIds)
    
    if (locationsError) throw locationsError
    
    // Combine location data with access counts
    return locations.map((location) => ({
      location,
      count: locationCounts[location.id] || 0,
    })).sort((a, b) => b.count - a.count)
  },

  // Get most popular/accessed buildings from audit logs
  // This uses audit logs as a proxy for popularity based on access activity
  async getBuildingStatistics() {
    // Get all audit logs for buildings
    const { data: buildingLogs, error } = await supabase
      .from('audit_logs')
      .select('entity_id, entity_type, description')
      .eq('entity_type', 'building')
      .order('created_at', { ascending: false })
      .limit(1000) // Get recent activity
    
    if (error) throw error
    
    // Get unique building IDs and their access counts
    const buildingCounts = {}
    buildingLogs.forEach((log) => {
      if (log.entity_id) {
        buildingCounts[log.entity_id] = (buildingCounts[log.entity_id] || 0) + 1
      }
    })
    
    // Get building details for the most accessed buildings
    const topBuildingIds = Object.entries(buildingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Top 20 most accessed
      .map(([id]) => id)
    
    if (topBuildingIds.length === 0) {
      return []
    }
    
    // Fetch building details
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select(`
        id,
        name,
        code,
        category,
        latitude,
        longitude
      `)
      .in('id', topBuildingIds)
    
    if (buildingsError) throw buildingsError
    
    // Combine building data with access counts
    return buildings.map((building) => ({
      building,
      count: buildingCounts[building.id] || 0,
    })).sort((a, b) => b.count - a.count)
  },
}

