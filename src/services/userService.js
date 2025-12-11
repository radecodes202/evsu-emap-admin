import { supabase } from '../lib/supabase'
import { auditService } from './auditService'

export const userService = {
  async getAll() {
    // Test profiles table first with a simple query
    const profilesTest = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    console.log('Profiles test result:', profilesTest)
    
    if (profilesTest.error) {
      console.error('Profiles table error details:', {
        message: profilesTest.error.message,
        details: profilesTest.error.details,
        hint: profilesTest.error.hint,
        code: profilesTest.error.code
      })
      // If profiles fails, just return admin_users
      const adminUsersResult = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (adminUsersResult.error) throw adminUsersResult.error
      return (adminUsersResult.data || []).map(u => ({ ...u, _source: 'admin_users' }))
    }
    
    // Fetch from both tables
    const [adminUsersResult, profilesResult] = await Promise.all([
      supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
    ])

    if (adminUsersResult.error) throw adminUsersResult.error
    if (profilesResult.error) throw profilesResult.error

    // Combine and mark source
    const adminUsers = (adminUsersResult.data || []).map(u => ({ ...u, _source: 'admin_users' }))
    const profiles = (profilesResult.data || []).map(u => ({ ...u, _source: 'profiles' }))
    
    return [...adminUsers, ...profiles].sort((a, b) => 
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

    // Try profiles if not found in admin_users
    const result = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (result.error) throw result.error
    return { ...result.data, _source: 'profiles' }
  },

  async create(user) {
    // Validate required fields (remove name requirement)
    if (!user.email) {
      throw new Error('Email is required')
    }

    // Determine which table to use based on role
    const isAdmin = user.role === 'admin'
    const tableName = isAdmin ? 'admin_users' : 'profiles'
    const entityType = isAdmin ? 'admin_user' : 'profile'

    // Build userData based on table - profiles doesn't have name column
    const userData = {
      email: user.email.trim(),
      role: user.role || 'user',
      is_active: user.is_active !== undefined ? user.is_active : true,
    }

    // Only include name for admin_users table
    if (isAdmin) {
      userData.name = user.name || user.email.trim() // Use email as name if not provided
    } else {
      // Generate UUID for profiles table (since it doesn't have default)
      userData.id = crypto.randomUUID()
    }

    // Check if email already exists in either table
    const [adminCheck, profileCheck] = await Promise.all([
      supabase.from('admin_users').select('id').eq('email', userData.email).maybeSingle(),
      supabase.from('profiles').select('id').eq('email', userData.email).maybeSingle()
    ])

    // Handle errors from the checks (ignore "not found" errors)
    if (adminCheck.error && adminCheck.error.code !== 'PGRST116') {
      throw adminCheck.error
    }
    if (profileCheck.error && profileCheck.error.code !== 'PGRST116') {
      throw profileCheck.error
    }

    if (adminCheck.data || profileCheck.data) {
      throw new Error('Email already exists')
    }

    console.log('Creating user:', { userData, tableName, isAdmin })

    const { data, error } = await supabase
      .from(tableName)
      .insert(userData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        tableName,
        userData
      })
      throw error
    }
    
    try {
      await auditService.logEvent({
        action_type: 'CREATE',
        entity_type: entityType,
        entity_id: data.id,
        new_values: userData,
        description: `Created ${entityType} ${userData.email}`,
      })
    } catch (e) {
      console.warn(`Audit log failed (create ${entityType}):`, e)
    }
    
    return { ...data, _source: tableName }
  },

  async update(id, updates) {
    // First, find which table the user is in
    const user = await this.getById(id)
    const tableName = user._source || 'profiles'
    const entityType = tableName === 'admin_users' ? 'admin_user' : 'profile'

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

    // If role changed, we might need to move between tables
    if (updates.role && updates.role !== user.role) {
      const newIsAdmin = updates.role === 'admin'
      const newTableName = newIsAdmin ? 'admin_users' : 'profiles'
      
      // If moving to different table, delete from old and insert to new
      if (tableName !== newTableName) {
        // Delete from old table
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id)
        
        if (deleteError) throw deleteError

        // Insert into new table
        const { data, error: insertError } = await supabase
          .from(newTableName)
          .insert({
            ...user,
            ...updateData,
            id: id, // Keep same ID
          })
          .select()
          .single()
        
        if (insertError) throw insertError

        try {
          await auditService.logEvent({
            action_type: 'UPDATE',
            entity_type: newIsAdmin ? 'admin_user' : 'profile',
            entity_id: id,
            new_values: updateData,
            description: `Updated and moved ${entityType} ${updateData.email || id} to ${newTableName}`,
          })
        } catch (e) {
          console.warn(`Audit log failed (update ${entityType}):`, e)
        }
        
        return { ...data, _source: newTableName }
      }
    }

    // Normal update in same table
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
      // Find which table the user is in - use userService.getById instead of this.getById
      const user = await userService.getById(id)
      
      if (!user) {
        throw new Error('User not found')
      }
      
      const tableName = user._source || 'profiles'
      const entityType = tableName === 'admin_users' ? 'admin_user' : 'profile'

      console.log('Deleting user:', { id, tableName, entityType })

      const { error, data } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .select() // Add select to verify deletion
      
      if (error) {
        console.error('Error deleting user:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          tableName,
          id
        })
        throw error
      }

      console.log('User deleted successfully:', data)

      // If user is from profiles and has auth user, also delete from auth
      if (tableName === 'profiles') {
        try {
          await supabase.auth.admin.deleteUser(id)
          console.log('Auth user deleted successfully')
        } catch (authError) {
          // Log but don't fail if auth user doesn't exist
          console.warn('Could not delete auth user (may not exist):', authError)
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
