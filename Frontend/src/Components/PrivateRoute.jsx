import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = ({ element: Component, requiredRole, ...rest }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/loginsignup" />;
    }

    if (requiredRole && requiredRole !== userRole) {
        if (userRole === 'Admin') {
            return <Navigate to="/admindb" />;
        } else if (userRole === 'Organizer') {
            return <Navigate to="/orgdb" />;
        } else if (userRole === 'User') {
            return <Navigate to="/userdb" />;
        }
        return <Navigate to="/" />;
    }

    return <Component {...rest} />;
};

PrivateRoute.propTypes = {
    element: PropTypes.elementType.isRequired,
    requiredRole: PropTypes.string.isRequired,
};

export default PrivateRoute;