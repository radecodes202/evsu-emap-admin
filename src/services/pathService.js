import { supabase } from '../lib/supabase'
import { auditService } from './auditService'

export const pathService = {
  async getAll() {
    const { data, error } = await supabase
      .from('paths')
      .select(`
        *,
        waypoints (
          waypoint_id,
          sequence,
          latitude,
          longitude,
          is_accessible,
          notes
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('paths')
      .select(`
        *,
        waypoints (
          waypoint_id,
          sequence,
          latitude,
          longitude,
          is_accessible,
          notes
        )
      `)
      .eq('path_id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(path) {
    const pathData = {
      path_name: path.path_name,
      path_type: path.path_type || 'walkway',
      is_active: path.is_active !== undefined ? path.is_active : true,
    }

    const { data, error } = await supabase
      .from('paths')
      .insert(pathData)
      .select()
      .single()
    
    if (error) throw error

    // If waypoints are provided, create them
    if (path.waypoints && path.waypoints.length > 0) {
      const waypoints = path.waypoints.map((wp, index) => ({
        path_id: data.path_id,
        sequence: index + 1,
        latitude: wp.latitude,
        longitude: wp.longitude,
        is_accessible: wp.is_accessible !== false,
        notes: wp.notes || wp.description || null,
      }))

      const { error: waypointsError } = await supabase
        .from('waypoints')
        .insert(waypoints)

      if (waypointsError) throw waypointsError
    }

    try {
      await auditService.logEvent({
        action_type: 'CREATE',
        entity_type: 'path',
        entity_id: data.path_id?.toString(),
        new_values: pathData,
        description: `Created path ${pathData.path_name || data.path_id}`,
      })
    } catch (e) {
      console.warn('Audit log failed (create path):', e)
    }
    return data
  },

  async update(id, updates) {
    const updateData = {}
    
    if (updates.path_name !== undefined) updateData.path_name = updates.path_name
    if (updates.path_type !== undefined) updateData.path_type = updates.path_type
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active

    const { data, error } = await supabase
      .from('paths')
      .update(updateData)
      .eq('path_id', id)
      .select()
      .single()
    
    if (error) throw error

    // If waypoints are provided, delete old ones and create new ones
    if (updates.waypoints && updates.waypoints.length > 0) {
      // Delete existing waypoints
      await supabase
        .from('waypoints')
        .delete()
        .eq('path_id', id)

      // Create new waypoints
      const waypoints = updates.waypoints.map((wp, index) => ({
        path_id: id,
        sequence: index + 1,
        latitude: wp.latitude,
        longitude: wp.longitude,
        is_accessible: wp.is_accessible !== false,
        notes: wp.notes || wp.description || null,
      }))

      const { error: waypointsError } = await supabase
        .from('waypoints')
        .insert(waypoints)

      if (waypointsError) throw waypointsError
    }

    try {
      await auditService.logEvent({
        action_type: 'UPDATE',
        entity_type: 'path',
        entity_id: id?.toString(),
        new_values: updateData,
        description: `Updated path ${updateData.path_name || id}`,
      })
    } catch (e) {
      console.warn('Audit log failed (update path):', e)
    }
    return data
  },

  async delete(id) {
    // Fetch path info before deletion for audit trail
    let pathInfo = null
    try {
      const { data } = await supabase
        .from('paths')
        .select('path_name, path_type')
        .eq('path_id', id)
        .single()
      pathInfo = data
    } catch (e) {
      console.warn('Failed to fetch path info before deletion:', e)
    }

    // Waypoints will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('paths')
      .delete()
      .eq('path_id', id)
    
    if (error) throw error
    try {
      await auditService.logEvent({
        action_type: 'DELETE',
        entity_type: 'path',
        entity_id: id?.toString(),
        old_values: pathInfo ? { name: pathInfo.path_name, type: pathInfo.path_type } : null,
        description: `Deleted path ${pathInfo?.path_name || id}`,
      })
    } catch (e) {
      console.warn('Audit log failed (delete path):', e)
    }
  },

  async addWaypoint(pathId, waypoint) {
    // Get current max sequence
    const { data: existing } = await supabase
      .from('waypoints')
      .select('sequence')
      .eq('path_id', pathId)
      .order('sequence', { ascending: false })
      .limit(1)

    const nextSequence = existing && existing.length > 0 
      ? existing[0].sequence + 1 
      : 1

    const { data, error } = await supabase
      .from('waypoints')
      .insert({
        path_id: pathId,
        sequence: nextSequence,
        latitude: waypoint.latitude,
        longitude: waypoint.longitude,
        is_accessible: waypoint.is_accessible !== false,
        notes: waypoint.notes || null,
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
      .eq('waypoint_id', waypointId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteWaypoint(waypointId) {
    const { error } = await supabase
      .from('waypoints')
      .delete()
      .eq('waypoint_id', waypointId)
    
    if (error) throw error
  }
}
