import { supabase } from '../lib/supabase'

export const auditService = {
  async getAll(filters = {}) {
    // Fetch audit logs
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

    const { data: logs, error } = await query.limit(filters.limit || 1000)
    
    if (error) throw error
    
    // Fetch user emails for logs that have user_id but no user_email
    const userIdsToFetch = [...new Set(
      logs
        .filter(log => log.user_id && !log.user_email)
        .map(log => log.user_id)
    )]
    
    let userEmailMap = {}
    if (userIdsToFetch.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIdsToFetch)
      
      if (!usersError && users) {
        userEmailMap = users.reduce((acc, user) => {
          acc[user.id] = user.email
          return acc
        }, {})
      }
    }
    
    // Enrich logs with user emails from users table
    return logs.map(log => ({
      ...log,
      user_email: log.user_email || userEmailMap[log.user_id] || null
    }))
  },

  async logEvent(eventData) {
    // Best-effort user context from localStorage
    let userCtx = null
    try {
      const stored = localStorage.getItem('user')
      if (stored) userCtx = JSON.parse(stored)
    } catch (e) {
      // ignore
    }

    // Helper to validate UUID-ish strings; if not, return null
    const toUuidOrNull = (val) => {
      if (!val || typeof val !== 'string') return null
      // basic UUID v4 format check
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      return uuidRegex.test(val) ? val : null
    }

    const actionType = (eventData.action_type || '').toUpperCase() || 'UNKNOWN'
    const entityType = (eventData.entity_type || '').toLowerCase() || 'unknown'

    const payload = {
      user_id: toUuidOrNull(eventData.user_id) ?? toUuidOrNull(userCtx?.id),
      user_email: eventData.user_email ?? userCtx?.email ?? null,
      action_type: actionType,
      entity_type: entityType,
      entity_id: eventData.entity_id || null,
      old_values: eventData.old_values || null,
      new_values: eventData.new_values || null,
      description: eventData.description || null,
      ip_address: eventData.ip_address || null,
      user_agent: eventData.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(payload)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
