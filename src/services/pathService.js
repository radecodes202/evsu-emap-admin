import { supabase } from '../lib/supabase'

export const pathService = {
  async getAll() {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        waypoints (
          id,
          sequence_order,
          latitude,
          longitude,
          name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        waypoints (
          id,
          sequence_order,
          latitude,
          longitude,
          name,
          description
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(path) {
    const pathData = {
      path_name: path.path_name,
      path_type: path.path_type || 'walkway',
      from_building_id: path.from_building_id || null,
      to_building_id: path.to_building_id || null,
      path_coordinates: path.path_coordinates || null,
      distance_meters: path.distance_meters || null,
      estimated_minutes: path.estimated_minutes || null,
      description: path.description || null,
      is_active: path.is_active !== undefined ? path.is_active : true,
    }

    const { data, error } = await supabase
      .from('routes')
      .insert(pathData)
      .select()
      .single()
    
    if (error) throw error

    // If waypoints are provided, create them
    if (path.waypoints && path.waypoints.length > 0) {
      const waypoints = path.waypoints.map((wp, index) => ({
        route_id: data.id,
        sequence_order: index + 1,
        latitude: wp.latitude,
        longitude: wp.longitude,
        name: wp.name || null,
        description: wp.description || null,
      }))

      const { error: waypointsError } = await supabase
        .from('waypoints')
        .insert(waypoints)

      if (waypointsError) throw waypointsError
    }

    return data
  },

  async update(id, updates) {
    const updateData = {
      path_name: updates.path_name,
      path_type: updates.path_type,
      from_building_id: updates.from_building_id,
      to_building_id: updates.to_building_id,
      path_coordinates: updates.path_coordinates,
      distance_meters: updates.distance_meters,
      estimated_minutes: updates.estimated_minutes,
      description: updates.description,
      is_active: updates.is_active,
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    )

    const { data, error } = await supabase
      .from('routes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    // Waypoints will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async addWaypoint(routeId, waypoint) {
    // Get current max sequence order
    const { data: existing } = await supabase
      .from('waypoints')
      .select('sequence_order')
      .eq('route_id', routeId)
      .order('sequence_order', { ascending: false })
      .limit(1)

    const nextSequence = existing && existing.length > 0 
      ? existing[0].sequence_order + 1 
      : 1

    const { data, error } = await supabase
      .from('waypoints')
      .insert({
        route_id: routeId,
        sequence_order: nextSequence,
        latitude: waypoint.latitude,
        longitude: waypoint.longitude,
        name: waypoint.name || null,
        description: waypoint.description || null,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateWaypoint(waypointId, updates) {
    const { data, error } = await supabase
      .from('waypoints')
      .update(updates)
      .eq('id', waypointId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteWaypoint(waypointId) {
    const { error } = await supabase
      .from('waypoints')
      .delete()
      .eq('id', waypointId)
    
    if (error) throw error
  }
}
