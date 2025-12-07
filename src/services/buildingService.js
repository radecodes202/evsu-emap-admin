import { supabase } from '../lib/supabase'

export const buildingService = {
  async getAll() {
    const { data, error } = await supabase
      .from('buildings')
      .select('*, locations(count)')
      .order('name')
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('buildings')
      .select('*, locations(*)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(building) {
    // Map the form fields to database fields
    const buildingData = {
      name: building.building_name,
      code: building.building_code,
      description: building.description || null,
      latitude: parseFloat(building.latitude),
      longitude: parseFloat(building.longitude),
      width_meters: building.width_meters ? parseFloat(building.width_meters) : 20,
      height_meters: building.height_meters ? parseFloat(building.height_meters) : 20,
      rotation_degrees: building.rotation_degrees ? parseFloat(building.rotation_degrees) : 0,
      category: building.category || 'academic', // Default category
      image_url: building.image_url || null,
    }

    const { data, error } = await supabase
      .from('buildings')
      .insert(buildingData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    // Map the form fields to database fields
    const buildingData = {
      name: updates.building_name,
      width_meters: updates.width_meters ? parseFloat(updates.width_meters) : undefined,
      height_meters: updates.height_meters ? parseFloat(updates.height_meters) : undefined,
      rotation_degrees: updates.rotation_degrees !== undefined ? parseFloat(updates.rotation_degrees) : undefined,
      code: updates.building_code,
      description: updates.description || null,
      latitude: parseFloat(updates.latitude),
      longitude: parseFloat(updates.longitude),
      category: updates.category || 'academic',
      image_url: updates.image_url || null,
    }
    
    // Remove undefined values
    Object.keys(buildingData).forEach(key => 
      buildingData[key] === undefined && delete buildingData[key]
    )

    const { data, error } = await supabase
      .from('buildings')
      .update(buildingData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('buildings')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async uploadImage(file, buildingId) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${buildingId}-${Date.now()}.${fileExt}`
    const filePath = `buildings/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('building-images')
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    const { data } = supabase.storage
      .from('building-images')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }
}
