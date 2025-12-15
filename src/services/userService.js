import { supabase } from '../lib/supabase'
import { auditService } from './auditService'

export const userService = {
  async getAll() {
    // Fetch from both admin_users and users tables
    const [adminUsersResult, usersResult] = await Promise.all([
      supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
    ])

    if (adminUsersResult.error) {
      console.error('Error fetching admin_users:', adminUsersResult.error)
    }
    if (usersResult.error) {
      console.error('Error fetching users:', usersResult.error)
    }

    // Combine and mark source
    const adminUsers = (adminUsersResult.data || []).map(u => ({ ...u, _source: 'admin_users' }))
    const users = (usersResult.data || []).map(u => ({ ...u, _source: 'users' }))
    
    return [...adminUsers, ...users].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )
  },

  async getById(id) {
    // Try admin_users first
    let { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error
    }
    
    if (data) {
      return { ...data, _source: 'admin_users' }
    }

    // Try users table if not found in admin_users
    const result = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (result.error) throw result.error
    return { ...result.data, _source: 'users' }
  },

  async create(user) {
    // Validate required fields
    if (!user.email) {
      throw new Error('Email is required')
    }
    if (!user.name) {
      throw new Error('Name is required')
    }

    // All admin panel users go to admin_users table
    // Mobile app users sign up via Supabase Auth (creates entry in users table automatically)
    const userData = {
      email: user.email.trim(),
      name: user.name.trim(),
      role: user.role || 'admin',
      is_active: user.is_active !== undefined ? user.is_active : true,
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', userData.email)
      .maybeSingle()

    if (existing) {
      throw new Error('Email already exists')
    }

    const { data, error } = await supabase
      .from('admin_users')
      .insert(userData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating admin user:', error)
      throw error
    }
    
    try {
      await auditService.logEvent({
        action_type: 'CREATE',
        entity_type: 'admin_user',
        entity_id: data.id,
        new_values: userData,
        description: `Created admin user ${userData.email}`,
      })
    } catch (e) {
      console.warn('Audit log failed (create admin_user):', e)
    }
    
    return { ...data, _source: 'admin_users' }
  },

  async update(id, updates) {
    // First, find which table the user is in
    const user = await this.getById(id)
    const tableName = user._source || 'admin_users'
    const entityType = tableName === 'admin_users' ? 'admin_user' : 'user'

    const updateData = {}
    
    if (updates.email !== undefined) updateData.email = updates.email
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.role !== undefined) updateData.role = updates.role
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active

    // users table doesn't have name column
    if (tableName === 'users') {
      delete updateData.name
    }

    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    try {
      await auditService.logEvent({
        action_type: 'UPDATE',
        entity_type: entityType,
        entity_id: id,
        new_values: updateData,
        description: `Updated ${entityType} ${updateData.email || id}`,
      })
    } catch (e) {
      console.warn(`Audit log failed (update ${entityType}):`, e)
    }
    
    return { ...data, _source: tableName }
  },

  async delete(id) {
    try {
      const user = await this.getById(id)
      
      if (!user) {
        throw new Error('User not found')
      }
      
      const tableName = user._source || 'admin_users'
      const entityType = tableName === 'admin_users' ? 'admin_user' : 'user'

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting user:', error)
        throw error
      }

      // If user is from users table and has auth user, also delete from auth
      if (tableName === 'users') {
        try {
          await supabase.auth.admin.deleteUser(id)
        } catch (authError) {
          console.warn('Could not delete auth user:', authError)
        }
      }
      
      try {
        await auditService.logEvent({
          action_type: 'DELETE',
          entity_type: entityType,
          entity_id: id,
          description: `Deleted ${entityType} ${id}`,
        })
      } catch (e) {
        console.warn(`Audit log failed (delete ${entityType}):`, e)
      }
    } catch (error) {
      console.error('Delete operation failed:', error)
      throw error
    }
  }
}
