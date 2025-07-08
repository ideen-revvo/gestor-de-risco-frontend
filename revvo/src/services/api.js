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
        throw new Error(`SAP API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling SAP ${endpoint}:`, error);
      throw error;
    }
  }

  async supabaseSelect(table, options = {}) {
    try {
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
    } catch (error) {
      console.error(`Error querying ${table}:`, error);
      throw error;
    }
  }

  async supabaseInsert(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
  }

  async supabaseUpdate(table, data, conditions) {
    try {
      let query = supabase.from(table).update(data);

      Object.entries(conditions).forEach(([column, value]) => {
        query = query.eq(column, value);
      });

      const { data: result, error } = await query.select();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  }

  async supabaseDelete(table, conditions) {
    try {
      let query = supabase.from(table).delete();

      Object.entries(conditions).forEach(([column, value]) => {
        query = query.eq(column, value);
      });

      const { error } = await query;

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();