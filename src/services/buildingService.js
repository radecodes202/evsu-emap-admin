import { supabase } from '../lib/supabase'
import { auditService } from './auditService'

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
    // Audit log (best-effort)
    try {
      await auditService.logEvent({
        action_type: 'CREATE',
        entity_type: 'building',
        entity_id: data.id,
        new_values: buildingData,
        description: `Created building ${buildingData.code || buildingData.name || data.id}`,
      })
    } catch (e) {
      console.warn('Audit log failed (create building):', e)
    }
    return data
  },

  async update(id, updates) {
    // Validate that required fields are present
    if (updates.building_name === undefined || updates.building_name === null || updates.building_name === '') {
      throw new Error('Building name is required and cannot be empty')
    }
    if (updates.building_code === undefined || updates.building_code === null || updates.building_code === '') {
      throw new Error('Building code is required and cannot be empty')
    }
    if (updates.latitude === undefined || updates.latitude === null || updates.latitude === '') {
      throw new Error('Latitude is required and cannot be empty')
    }
    if (updates.longitude === undefined || updates.longitude === null || updates.longitude === '') {
      throw new Error('Longitude is required and cannot be empty')
    }

    // Map the form fields to database fields
    // Required fields - validated above, so we know they exist
    const buildingData = {
      name: updates.building_name,
      code: updates.building_code,
      latitude: parseFloat(updates.latitude),
      longitude: parseFloat(updates.longitude),
    }

    // Optional fields - only include if provided
    if (updates.width_meters !== undefined && updates.width_meters !== null && updates.width_meters !== '') {
      buildingData.width_meters = parseFloat(updates.width_meters)
    }
    if (updates.height_meters !== undefined && updates.height_meters !== null && updates.height_meters !== '') {
      buildingData.height_meters = parseFloat(updates.height_meters)
    }
    if (updates.rotation_degrees !== undefined && updates.rotation_degrees !== null && updates.rotation_degrees !== '') {
      buildingData.rotation_degrees = parseFloat(updates.rotation_degrees)
    }
    if (updates.description !== undefined) {
      buildingData.description = updates.description || null
    }
    if (updates.category !== undefined && updates.category !== null) {
      buildingData.category = updates.category
    }
    if (updates.image_url !== undefined) {
      buildingData.image_url = updates.image_url || null
    }

    // Ensure we have at least one field to update
    if (Object.keys(buildingData).length === 0) {
      throw new Error('No valid fields provided for update')
    }

    const { data, error } = await supabase
      .from('buildings')
      .update(buildingData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    try {
      await auditService.logEvent({
        action_type: 'UPDATE',
        entity_type: 'building',
        entity_id: id,
        new_values: buildingData,
        description: `Updated building ${buildingData.code || buildingData.name || id}`,
      })
    } catch (e) {
      console.warn('Audit log failed (update building):', e)
    }
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('buildings')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    try {
      await auditService.logEvent({
        action_type: 'DELETE',
        entity_type: 'building',
        entity_id: id,
        description: `Deleted building ${id}`,
      })
    } catch (e) {
      console.warn('Audit log failed (delete building):', e)
    }
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
