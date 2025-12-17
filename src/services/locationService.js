import { supabase } from '../lib/supabase'
import { auditService } from './auditService'

export const locationService = {
  async getAll() {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        building:buildings(id, name, code)
      `)
      .order('floor', { ascending: true })
      .order('room_number', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getByBuilding(buildingId) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('building_id', buildingId)
      .order('floor', { ascending: true })
      .order('room_number', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        building:buildings(id, name, code)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(location) {
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select()
      .single()
    
    if (error) throw error
    try {
      await auditService.logEvent({
        action_type: 'CREATE',
        entity_type: 'location',
        entity_id: data.id,
        new_values: location,
        description: `Created location ${location.name || location.room_number || data.id}`,
      })
    } catch (e) {
      console.warn('Audit log failed (create location):', e)
    }
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    try {
      await auditService.logEvent({
        action_type: 'UPDATE',
        entity_type: 'location',
        entity_id: id,
        new_values: updates,
        description: `Updated location ${updates.name || updates.room_number || id}`,
      })
    } catch (e) {
      console.warn('Audit log failed (update location):', e)
    }
    return data
  },

  async delete(id) {
    // Fetch location info before deletion for audit trail
    let locationInfo = null
    try {
      const { data } = await supabase
        .from('locations')
        .select('name, room_number, building:buildings(name, code)')
        .eq('id', id)
        .single()
      locationInfo = data
    } catch (e) {
      console.warn('Failed to fetch location info before deletion:', e)
    }

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    try {
      const buildingName = locationInfo?.building?.name || locationInfo?.building?.code || 'Unknown Building'
      const locationName = locationInfo?.name || locationInfo?.room_number || id
      await auditService.logEvent({
        action_type: 'DELETE',
        entity_type: 'location',
        entity_id: id,
        old_values: locationInfo ? { 
          name: locationInfo.name, 
          room_number: locationInfo.room_number,
          building: buildingName
        } : null,
        description: `Deleted location ${locationName} in ${buildingName}`,
      })
    } catch (e) {
      console.warn('Audit log failed (delete location):', e)
    }
  }
}
