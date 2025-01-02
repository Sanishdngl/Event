import { useState } from 'react';
import { Menu,  Bell, Calendar, Users, BarChart3,  Tag, CreditCard,  Search, Sun, Moon, Filter, Grid, LogOut, HelpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const chartData = [
    { name: 'Jan', events: 40, users: 24 },
    { name: 'Feb', events: 30, users: 35 },
    { name: 'Mar', events: 45, users: 42 },
    { name: 'Apr', events: 50, users: 48 },
    { name: 'May', events: 35, users: 38 },
    { name: 'Jun', events: 60, users: 52 }
  ];

  const themeClass = isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800';
  const sidebarClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const componentClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/loginsignup';
  };

  return (
    <div className={`min-h-screen ${themeClass} transition-colors duration-300`}>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 ${sidebarClass} shadow-lg transition-transform duration-300 transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-30`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Grid className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">eventA</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center p-3 bg-gray-700/30 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="ml-3">
              <p className="font-medium">Admin User</p>
              <p className="text-sm opacity-60">admin@eventpro.com</p>
            </div>
          </div>
        </div>

        <nav className="mt-2 px-3">
          {[
            { icon: BarChart3, label: 'Overview', notifications: 0 },
            { icon: Calendar, label: 'Events', notifications: 12 },
            { icon: Users, label: 'Users', notifications: 3 },
            { icon: Tag, label: 'Categories', notifications: 0 },
            { icon: CreditCard, label: 'Payments', notifications: 5 },
            
          ].map(({ icon: Icon, label, notifications }) => (
            <div 
              key={label}
              onClick={() => setActiveTab(label)}
              className={`flex items-center px-4 py-3 my-1 rounded-xl cursor-pointer transition-all duration-200
                ${activeTab === label 
                  ? 'bg-indigo-500 text-white' 
                  : 'hover:bg-gray-700/30'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="ml-3 flex-1">{label}</span>
              {notifications > 0 && (
                <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
                  {notifications}
                </span>
              )}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="space-y-2">
            <button className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-gray-700/30 transition-colors">
              <HelpCircle className="w-5 h-5" />
              <span className="ml-3">Help Center</span>
            </button>
            <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-gray-700/30 transition-colors text-red-400">
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className={`${componentClass} border-b sticky top-0 z-20 transition-colors duration-300`}>
          <div className="flex items-center justify-between h-16 px-6">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 ml-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <input 
                  type="text"
                  placeholder="Search everything..."
                  className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-700/30 border-gray-700 focus:border-indigo-500' 
                      : 'bg-gray-100 border-gray-200 focus:border-indigo-500'
                  } focus:outline-none transition-colors`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button className="relative p-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back, Admin! 👋</h1>
            <p className="mt-1 opacity-60">Heres whats happening with your events today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: 'Total Events', value: '2,543', change: '+12.5%', icon: Calendar, color: 'indigo' },
              { title: 'Active Users', value: '45.2k', change: '+5.1%', icon: Users, color: 'green' },
              { title: 'Total Revenue', value: '$87.5k', change: '+8.3%', icon: CreditCard, color: 'purple' },
              { title: 'New Categories', value: '29', change: '+2.5%', icon: Tag, color: 'blue' },
            ].map(({ title, value, change, icon: Icon, color }) => (
              <div key={title} 
                className={`${componentClass} border rounded-xl p-6 transition-transform duration-300 hover:scale-105`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm opacity-60">{title}</p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>
                    <span className={`text-sm text-${color}-500 bg-${color}-500/10 px-2 py-0.5 rounded-full mt-2 inline-block`}>
                      {change}
                    </span>
                  </div>
                  <div className={`p-3 rounded-lg bg-${color}-500/10`}>
                    <Icon className={`w-6 h-6 text-${color}-500`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className={`${componentClass} border rounded-xl mb-8`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Events Analytics</h3>
                  <p className="text-sm opacity-60">Monthly event and user growth</p>
                </div>
                <button className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  <Filter className="w-4 h-4" />
                </button>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
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
                      stroke="#6366f1" 
                      strokeWidth={2}
                      dot={{ fill: '#6366f1' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={{ fill: '#a855f7' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Events Table */}
          <div className={`${componentClass} border rounded-xl`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Recent Events</h3>
                  <p className="text-sm opacity-60">Latest event submissions requiring approval</p>
                </div>
                <button className={`px-4 py-2 rounded-lg text-sm bg-indigo-500 hover:bg-indigo-600 text-white transition-colors`}>
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="pb-3 font-medium opacity-60">Event</th>
                      <th className="pb-3 font-medium opacity-60">Organizer</th>
                      <th className="pb-3 font-medium opacity-60">Date</th>
                      <th className="pb-3 font-medium opacity-60">Status</th>
                      <th className="pb-3 font-medium opacity-60">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((_, i) => (
                      <tr key={i} className="border-b border-gray-700">
                        <td className="py-4">
                          <div>
                            <p className="font-medium">Tech Summit 2025</p>
                            <p className="text-sm opacity-60">Technology</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              J
                            </div>
                            <span className="ml-3">John Doe</span>
                          </div>
                        </td>
                        <td className="py-4">Mar 15, 2025</td>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-full text-sm bg-yellow-500/10 text-yellow-500">
                            Pending
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button className="px-3 py-1 rounded-lg text-sm bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">
                              Approve
                            </button>
                            <button className="px-3 py-1 rounded-lg text-sm bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;