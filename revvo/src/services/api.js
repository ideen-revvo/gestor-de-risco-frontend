import { supabase } from '../lib/supabase.js';

const SAP_BASE_URL = 'http://localhost:3001/cpi';

class ApiService {
  constructor() {
    this.sapBaseUrl = SAP_BASE_URL;
  }

  async sapRequest(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.sapBaseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SAP API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`SAP Error: ${result.error}`);
      }

      return result;
    } catch (error) {
      if (error.message.includes('internal server error') || 
          error.message.includes('MPL ID')) {
        return { error: 'SAP_INTERNAL_ERROR', message: error.message };
      }
      throw error;
    }
  }

  async supabaseSelect(table, options = {}) {
    let query = supabase.from(table).select(options.select || '*');

    if (options.eq) {
      Object.entries(options.eq).forEach(([column, value]) => {
        query = query.eq(column, value);
      });
    }

    if (options.in) {
      Object.entries(options.in).forEach(([column, values]) => {
        query = query.in(column, values);
      });
    }

    if (options.gte) {
      Object.entries(options.gte).forEach(([column, value]) => {
        query = query.gte(column, value);
      });
    }

    if (options.lte) {
      Object.entries(options.lte).forEach(([column, value]) => {
        query = query.lte(column, value);
      });
    }

    if (options.like) {
      Object.entries(options.like).forEach(([column, pattern]) => {
        query = query.like(column, pattern);
      });
    }

    if (options.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.single) {
      query = query.single();
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async supabaseInsert(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) throw error;
    return result;
  }

  async supabaseUpdate(table, data, conditions) {
    let query = supabase.from(table).update(data);

    Object.entries(conditions).forEach(([column, value]) => {
      query = query.eq(column, value);
    });

    const { data: result, error } = await query.select();

    if (error) throw error;
    return result;
  }

  async supabaseDelete(table, conditions) {
    let query = supabase.from(table).delete();

    Object.entries(conditions).forEach(([column, value]) => {
      query = query.eq(column, value);
    });

    const { error } = await query;

    if (error) throw error;
    return true;
  }

  async supabaseUpsert(table, data, options = {}) {
    const { data: result, error } = await supabase
      .from(table)
      .upsert(data, { onConflict: options.onConflict || 'id' })
      .select();

    if (error) throw error;
    return result;
  }

  async getUserProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: userProfile, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('logged_id', session.user.id)
      .single();

    if (error) throw error;
    return userProfile;
  }

  async executeWithRetry(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries || 
            !error.message.includes('internal server error')) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
}

export const apiService = new ApiService();