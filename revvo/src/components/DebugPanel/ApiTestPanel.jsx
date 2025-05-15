import { useState, useEffect } from 'react';
import { fetchCustomers } from '../../lib/customerApi';

export default function ApiTestPanel() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setError(null);
        setAuthStatus('Authenticating and fetching customers...');
        const data = await fetchCustomers(true); // Force refresh to test the API
        setCustomers(data || []);
        setAuthStatus('Authentication successful!');
      } catch (err) {
        setError(err.message || 'Failed to fetch customers');
        setAuthStatus('Authentication failed');
        console.error('Error loading customers:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthStatus('Authenticating and fetching customers...');
      const data = await fetchCustomers(true); // Force refresh
      setCustomers(data || []);
      setAuthStatus('Authentication successful!');
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
      setAuthStatus('Authentication failed');
      console.error('Error refreshing customers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Customer API Test</h2>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {authStatus && (
        <div className={`mb-4 p-3 rounded ${authStatus.includes('failed') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-700'}`}>
          Status: {authStatus}
        </div>
      )}

      <div className="mb-2">
        <span className="font-semibold">Total Customers:</span> {customers.length}
      </div>

      <div className="overflow-auto max-h-[500px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.length > 0 ? (
              customers.slice(0, 10).map(customer => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.company_code}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  {loading ? 'Loading customers...' : 'No customers found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {customers.length > 10 && (
          <div className="text-center text-gray-500 mt-2">
            Showing 10 of {customers.length} customers
          </div>
        )}
      </div>
    </div>
  );
}
