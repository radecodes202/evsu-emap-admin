import { supabase } from '../lib/supabase'

export const feedbackService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    const { data, error } = await query.limit(filters.limit || 1000)
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(feedback) {
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: feedback.user_id || null,
        user_email: feedback.user_email || null,
        name: feedback.name || null,
        category: feedback.category,
        subject: feedback.subject,
        message: feedback.message,
        status: feedback.status || 'new',
        priority: feedback.priority || 'medium',
        rating: feedback.rating || null,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('user_feedback')
      .update({
        status: updates.status,
        priority: updates.priority,
        admin_notes: updates.admin_notes,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('user_feedback')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
