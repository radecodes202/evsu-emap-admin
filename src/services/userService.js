import { supabase } from '../lib/supabase'
import { auditService } from './auditService'

export const userService = {
  async getAll() {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(user) {
    const userData = {
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      is_active: user.is_active !== undefined ? user.is_active : true,
    }

    const { data, error } = await supabase
      .from('admin_users')
      .insert(userData)
      .select()
      .single()
    
    if (error) throw error
    try {
      await auditService.logEvent({
        action_type: 'CREATE',
        entity_type: 'admin_user',
        entity_id: data.id,
        new_values: userData,
        description: `Created admin user ${userData.email}`,
      })
    } catch (e) {
      console.warn('Audit log failed (create admin user):', e)
    }
    return data
  },

  async update(id, updates) {
    const updateData = {
      email: updates.email,
      name: updates.name,
      role: updates.role,
      is_active: updates.is_active,
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    )

    const { data, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    try {
      await auditService.logEvent({
        action_type: 'UPDATE',
        entity_type: 'admin_user',
        entity_id: id,
        new_values: updateData,
        description: `Updated admin user ${updateData.email || id}`,
      })
    } catch (e) {
      console.warn('Audit log failed (update admin user):', e)
    }
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    try {
      await auditService.logEvent({
        action_type: 'DELETE',
        entity_type: 'admin_user',
        entity_id: id,
        description: `Deleted admin user ${id}`,
      })
    } catch (e) {
      console.warn('Audit log failed (delete admin user):', e)
    }
  }
}
