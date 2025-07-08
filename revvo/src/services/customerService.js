import { apiService } from './api.js';

export const CustomerService = {
  async getCustomerCreditLimits(customerId) {
    if (!customerId) return null;

    const customerData = await apiService.supabaseSelect('customer', {
      select: 'credit_limits_id',
      eq: { id: customerId },
      single: true
    });

    if (!customerData?.credit_limits_id) {
      return {
        creditLimitsId: null,
        creditLimit: '',
        prepaidLimit: '',
        comments: ''
      };
    }

    const creditLimitData = await apiService.supabaseSelect('credit_limit_amount', {
      eq: { id: customerData.credit_limits_id },
      single: true
    });

    return {
      creditLimitsId: creditLimitData.id,
      creditLimit: creditLimitData.credit_limit ? 
        creditLimitData.credit_limit.toLocaleString('pt-BR', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }) : '',
      prepaidLimit: creditLimitData.prepaid_limit ? 
        creditLimitData.prepaid_limit.toLocaleString('pt-BR', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }) : '',
      comments: creditLimitData.comments || ''
    };
  },

  async updateCustomerCreditLimits(customerId, limitData) {
    const customer = await apiService.supabaseSelect('customer', {
      select: 'credit_limits_id',
      eq: { id: customerId },
      single: true
    });

    if (customer.credit_limits_id) {
      return await apiService.supabaseUpdate('credit_limit_amount', limitData, {
        id: customer.credit_limits_id
      });
    } else {
      const newLimit = await apiService.supabaseInsert('credit_limit_amount', limitData);
      await apiService.supabaseUpdate('customer', {
        credit_limits_id: newLimit[0].id
      }, { id: customerId });
      return newLimit;
    }
  },

  async getCustomersByCompanyGroup(userCompanyId) {
    try {
      const companyData = await apiService.supabaseSelect('company', {
        select: 'corporate_group_id',
        eq: { id: userCompanyId },
        single: true
      });

      if (!companyData?.corporate_group_id) {
        throw new Error('Corporate group not found');
      }

      const companiesData = await apiService.supabaseSelect('company', {
        select: 'id',
        eq: { corporate_group_id: companyData.corporate_group_id }
      });

      const companyIds = companiesData.map(c => c.id);
      
      return await apiService.supabaseSelect('customer', {
        select: 'id, name, company_code',
        in: { company_id: companyIds },
        order: { column: 'name', ascending: true }
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  async getCustomerById(id) {
    return await apiService.supabaseSelect('customer', {
      eq: { id },
      single: true
    });
  }
};