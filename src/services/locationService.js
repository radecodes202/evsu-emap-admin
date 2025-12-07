import { supabase } from '../lib/supabase'

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
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
