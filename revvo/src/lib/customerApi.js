/**
 * Utility functions for fetching customer data from external API
 */

// API URLs
const CUSTOMER_API_URL = 'https://cerc-financeintegrator-1ciub5oj.it-cpi008-rt.cfapps.br10.hana.ondemand.com/http/BAPI_CUSTOMER_GETLIST';
const AUTH_URL = 'https://cerc-financeintegrator-1ciub5oj.authentication.br10.hana.ondemand.com/oauth/token';

// Authentication credentials
const CLIENT_ID = 'sb-79dce5bd-990a-4fa3-b579-94e05e47dc3a!b8564|it-rt-cerc-financeintegrator-1ciub5oj!b106';
const CLIENT_SECRET = '70b3e70c-e17b-485f-a238-0632c3459e79$1udPFTt3U92bvg1mQjppghIh9fB1aVGIcyR58bWwjgw=';

// Cache
let customersCache = null;
let cacheTimestamp = null;
let tokenCache = null;
let tokenTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for customer data
const TOKEN_DURATION = 55 * 60 * 1000; // 55 minutes for token (typically tokens last 1 hour)

/**
 * Gets an authentication token from the API
 * @param {boolean} forceRefresh - Whether to force a refresh of the token
 * @returns {Promise<string>} Authentication token
 */
export async function getAuthToken(forceRefresh = false) {
  const now = Date.now();
  
  // Return cached token if still valid
  if (
    !forceRefresh && 
    tokenCache && 
    tokenTimestamp && 
    now - tokenTimestamp < TOKEN_DURATION
  ) {
    return tokenCache;
  }

  try {
    console.log('Fetching new authentication token...');
    
    // Create the form data for token request
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', CLIENT_ID);
    formData.append('client_secret', CLIENT_SECRET);
    
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Authentication error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.access_token) {
      throw new Error('No access token returned from authentication server');
    }
      // Cache the token
    tokenCache = data.access_token;
    tokenTimestamp = now;
    
    console.log('Authentication successful, token received');
    return data.access_token;
  } catch (error) {
    console.error('Error getting authentication token:', error);
    throw error; // Rethrow the error as authentication is essential
  }
}

/**
 * Fetches customer list from the external API
 * @param {boolean} forceRefresh - Whether to force a refresh of the cache
 * @returns {Promise<Array>} Customer list
 */
export async function fetchCustomers(forceRefresh = false) {
  // Check if we have cached data that's still valid
  const now = Date.now();
  if (
    !forceRefresh && 
    customersCache && 
    cacheTimestamp && 
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return customersCache;
  }

  try {
    // Get authentication token first
    const token = await getAuthToken();
    
    console.log('Fetching customers from API...');
    const response = await fetch(CUSTOMER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        "MAXROWS": "9999999",
        "IDRANGE": {
          "item": {
            "SIGN": "I",
            "OPTION": "BT",
            "LOW": "0000000001",
            "HIGH": "9999999999"
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }    const data = await response.json();
    
    // Transform the data to match the format used in the application
    const transformedData = transformCustomerData(data);
    
    // Update cache
    customersCache = transformedData;
    cacheTimestamp = now;
    
    console.log(`Successfully fetched ${transformedData.length} customers from API`);
    return transformedData;} catch (error) {
    console.error('Error fetching customers from API:', error);
    
    // If error is due to authentication, try once with a fresh token
    if (error.message && (error.message.includes('401') || error.message.includes('unauthorized'))) {
      try {
        console.log('Authentication error, trying with fresh token...');
        const token = await getAuthToken(true); // Force token refresh
        
        const response = await fetch(CUSTOMER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            "MAXROWS": "9999999",
            "IDRANGE": {
              "item": {
                "SIGN": "I",
                "OPTION": "BT",
                "LOW": "0000000001",
                "HIGH": "9999999999"
              }
            }
          })
        });

        if (!response.ok) {
          throw new Error(`API error on retry: ${response.status}`);
        }

        const data = await response.json();
        const transformedData = transformCustomerData(data);
        
        // Update cache
        customersCache = transformedData;
        cacheTimestamp = Date.now();
        
        return transformedData;
      } catch (retryError) {
        console.error('Error on retry:', retryError);
      }
    }
    
    // If we have cached data, return it even if it's expired
    if (customersCache) {
      console.log('Returning cached customer data due to API error');
      return customersCache;
    }
    
    return [];
  }
}

/**
 * Transforms the raw API response to the format expected by the application
 * @param {Object} apiData - The raw API response
 * @returns {Array} Transformed customer data array
 */
function transformCustomerData(apiData) {
  // You'll need to adjust this based on the actual response format
  // from the external API to match what your application expects
  
  // If apiData contains a CUSTOMER_LIST array
  if (apiData && apiData.CUSTOMER_LIST && Array.isArray(apiData.CUSTOMER_LIST.item)) {
    return apiData.CUSTOMER_LIST.item.map(customer => ({
      id: customer.CUSTOMER || customer.KUNNR,
      name: customer.NAME || customer.NAME1,
      company_code: customer.CUSTOMER || customer.KUNNR,
      costumer_email: customer.EMAIL || '',
      costumer_phone: customer.PHONE || customer.TELF1 || '',
      costumer_cnpj: customer.CNPJ || customer.STCD1 || '',
      costumer_razao_social: customer.NAME || customer.NAME1 || '',
      // Add other fields as needed
    }));
  }
  
  // Fallback if the response format is different
  console.warn('Unexpected API response format:', apiData);
  return [];
}

/**
 * Gets a specific customer by ID
 * @param {string} customerId - The customer ID to fetch
 * @returns {Promise<Object|null>} Customer object or null if not found
 */
export async function getCustomerById(customerId) {
  try {
    const customers = await fetchCustomers();
    return customers.find(customer => customer.id === customerId) || null;
  } catch (error) {
    console.error('Error getting customer by ID:', error);
    return null;
  }
}
