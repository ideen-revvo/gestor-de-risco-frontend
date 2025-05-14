// Global state for company ID
let varCompanyId = 5; // Initialize with default company ID
let debugPanel = false; // Set to true to show debug panel by default
export let varPasswordOk = false;

export const setGlobalCompanyId = (id) => {
  varCompanyId = id || 5; // Ensure we always have a fallback value
};

export const setDebugPanel = (enabled) => {
  debugPanel = enabled;
};

export const isDebugEnabled = () => {
  return debugPanel;
};

export const getGlobalCompanyId = () => {
  return varCompanyId || 5; // Always return a valid ID
};

export const setVarPasswordOk = (value) => { varPasswordOk = value; };
export const getVarPasswordOk = () => varPasswordOk;

// Initialize with DEFAULT_COMPANY_ID if in dev/qa
export const initializeCompanyId = async (supabase) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user?.id) {
      const { data: userProfile, error } = await supabase
        .from('user_profile')
        .select('company_id')
        .eq('logged_id', session.user.id)
        .single();
      
      if (userProfile?.company_id) {
        setGlobalCompanyId(userProfile.company_id);
        return;
      }
    }
    
    // If no user session or company_id found, use default
    setGlobalCompanyId(5); // DEFAULT_COMPANY_ID value
  } catch (error) {
    console.error('Error initializing company ID:', error);
    setGlobalCompanyId(5); // Fallback to DEFAULT_COMPANY_ID
  }
};