export const getToken = () => {
  return localStorage.getItem('token');
};

export const getDecodedToken = () => {
  const token = getToken();
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      // Ensure user ID is present
      if (!decoded.userId && !decoded.sub) {
        console.error('Token missing user ID');
        return null;
      }
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
};
// Function to set token and role
export const setAuth = (token, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
};

// Function to clear auth data
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

// Function to get the user's role from the JWT token
export const getUserRole = () => {
  const token = getToken();
  if (token) {
    try {
      // Decode the JWT token to get the role
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      return decodedToken?.role || localStorage.getItem('role');
    } catch (error) {
      console.error('Error decoding token:', error);
      // Fallback to localStorage role if token decoding fails
      return localStorage.getItem('role');
    }
  }
  return null;
};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  const role = localStorage.getItem('role');
  
  if (!token || !role) {
    return false;
  }

  try {
    // Check if token is expired
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      clearAuth(); // Clear expired token
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// Function to validate role
export const hasRole = (requiredRole) => {
  const userRole = getUserRole();
  return userRole === requiredRole;
};

// Function to get dashboard URL based on role
export const getDashboardUrl = () => {
  const role = getUserRole();
  switch (role) {
    case 'Admin':
      return '/admindb';
    case 'Organizer':
      return '/orgdb';
    case 'User':
      return '/userdb';
    default:
      return '/';
  }
};