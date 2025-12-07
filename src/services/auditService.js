import { supabase } from '../lib/supabase'

export const auditService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.action_type) {
      query = query.eq('action_type', filters.action_type)
    }
    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type)
    }
    if (filters.user_email) {
      query = query.ilike('user_email', `%${filters.user_email}%`)
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date)
    }

    const { data, error } = await query.limit(filters.limit || 1000)
    
    if (error) throw error
    return data
  },

  async logEvent(eventData) {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: eventData.user_id || null,
        user_email: eventData.user_email || null,
        action_type: eventData.action_type,
        entity_type: eventData.entity_type,
        entity_id: eventData.entity_id || null,
        old_values: eventData.old_values || null,
        new_values: eventData.new_values || null,
        description: eventData.description || null,
        ip_address: eventData.ip_address || null,
        user_agent: eventData.user_agent || null,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
