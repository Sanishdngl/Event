import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, Tag, Filter, FileText, Clock, Shield, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '../../../Components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../Components/ui/dropdown";
import api from '../../../utils/api';

const OverviewDashboard = ({ isDarkMode }) => {
  const [dashboardData, setDashboardData] = useState({
    statsData: [],
    analyticsData: [],
    usersByRole: {},
    eventStats: {},
    categoryStats: {},
    requestStats: {},
    roleStats: {
      distribution: {},
      permissions: {},
      eventStats: {}
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');

  const componentClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.safeGet('/admin/dashboard-stats');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const renderStatsGrid = () => (
    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
      {dashboardData.statsData.map(({ title, value, change, icon, color }) => {
        const IconComponent = {
          Calendar,
          Users,
          CheckCircle,
          Tag,
          FileText,
          Clock
        }[icon] || Calendar;

        return (
          <div key={title} className={`${componentClass} border rounded-xl p-6 transition-transform duration-300 hover:scale-105`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-60">{title}</p>
                <h3 className="mt-1 text-2xl font-bold">{value}</h3>
                <span className={`text-sm text-${color}-500 bg-${color}-500/10 px-2 py-0.5 rounded-full mt-2 inline-block`}>
                  {change}
                </span>
              </div>
              <div className={`p-3 rounded-lg bg-${color}-500/10`}>
                <IconComponent className={`w-6 h-6 text-${color}-500`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderAnalyticsChart = () => (
    <div className={`${componentClass} border rounded-xl mb-8`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Events & Users Analytics</h3>
            <p className="text-sm opacity-60">Monthly growth trends</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <Filter className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedRole('all')}>All Roles</DropdownMenuItem>
              {Object.keys(dashboardData.roleStats.distribution || {}).map((role) => (
                <DropdownMenuItem key={role} onClick={() => setSelectedRole(role)}>
                  {role}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dashboardData.analyticsData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
              <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  borderColor: isDarkMode ? '#334155' : '#e2e8f0'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="events" 
                name="Total Events"
                stroke="#6366f1" 
                strokeWidth={2} 
                dot={{ fill: '#6366f1' }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                name="Active Users"
                stroke="#a855f7" 
                strokeWidth={2} 
                dot={{ fill: '#a855f7' }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                name="Pending Events"
                stroke="#eab308" 
                strokeWidth={2} 
                dot={{ fill: '#eab308' }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="requests" 
                name="Event Requests"
                stroke="#ec4899" 
                strokeWidth={2} 
                dot={{ fill: '#ec4899' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderEventStatusBreakdown = () => (
    <div className={`${componentClass} border rounded-xl mb-8`}>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4">Event Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(dashboardData.eventStats).map(([status, count]) => (
            <div key={status} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <p className="text-sm opacity-60 capitalize">{status}</p>
              <p className="text-xl font-bold mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRoleBasedStats = () => (
    <div className={`${componentClass} border rounded-xl mb-8`}>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4">Role-Based Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(dashboardData.roleStats.distribution || {}).map(([role, data]) => (
            <div key={role} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{role}</h4>
                <Shield className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold mb-2">{data.count}</p>
              <div className="space-y-2">
                <p className="text-sm">
                  Events: {dashboardData.roleStats.eventStats[role]?.totalEvents || 0}
                </p>
                <p className="text-sm">
                  Permissions: {(dashboardData.roleStats.permissions[role] || []).length}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPermissionsAlert = () => {
    if (selectedRole === 'all') return null;
    const permissions = dashboardData.roleStats.permissions[selectedRole] || [];
    
    return (
      <Alert className="mb-8">
        <AlertDescription>
          <span className="font-semibold">{selectedRole}</span> role has {permissions.length} permissions:
          {permissions.join(', ')}
        </AlertDescription>
      </Alert>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderStatsGrid()}
      {renderPermissionsAlert()}
      {renderAnalyticsChart()}
      {renderEventStatusBreakdown()}
      {renderRoleBasedStats()}
    </div>
  );
};

export default OverviewDashboard;