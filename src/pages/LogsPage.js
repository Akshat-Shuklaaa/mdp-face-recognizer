// src/pages/LogsPage.js
import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Download, Trash2, Filter } from 'lucide-react';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
  const [filterStatus, setFilterStatus] = useState('all'); // all, known, unknown
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    try {
      const storedLogs = localStorage.getItem('recognitionLogs');
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const sortedLogs = useMemo(() => {
    let sortableItems = [...logs];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Special handling for date and time
        if (sortConfig.key === 'date' || sortConfig.key === 'time') {
          aValue = new Date(a.date + ' ' + a.time).getTime();
          bValue = new Date(b.date + ' ' + b.time).getTime();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [logs, sortConfig]);

  const filteredLogs = useMemo(() => {
    return sortedLogs.filter(log => {
      // Text search filter
      const matchesSearch = 
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.location.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Status filter
      if (filterStatus !== 'all') {
        const matchesStatus = filterStatus === 'known' 
          ? log.status === 'Known' 
          : log.status === 'Unknown';
        if (!matchesStatus) return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const logDate = new Date(log.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
          const logDateStr = logDate.toDateString();
          const todayStr = today.toDateString();
          if (logDateStr !== todayStr) return false;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (logDate < weekAgo) return false;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (logDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [sortedLogs, searchTerm, filterStatus, dateFilter]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'ascending') return <ChevronUp size={16} />;
    return <ChevronDown size={16} />;
  };

  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      alert('No logs to export');
      return;
    }

    const headers = ['Date', 'Time', 'Name', 'Status', 'Location', 'Confidence'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.date,
        log.time,
        log.name,
        log.status,
        log.location,
        log.confidence || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recognition-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      localStorage.setItem('recognitionLogs', JSON.stringify([]));
      setLogs([]);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setDateFilter('all');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Recognition Logs</h1>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Download size={18} className="mr-2" />
            Export CSV
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash2 size={18} className="mr-2" />
            Clear All
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="known">Known Only</option>
            <option value="unknown">Unknown Only</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
          >
            <Filter size={18} className="mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">{logs.length}</p>
            <p className="text-sm text-gray-600">Total Logs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{logs.filter(l => l.status === 'Known').length}</p>
            <p className="text-sm text-gray-600">Known</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{logs.filter(l => l.status === 'Unknown').length}</p>
            <p className="text-sm text-gray-600">Unknown</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{filteredLogs.length}</p>
            <p className="text-sm text-gray-600">Filtered Results</p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: 'date', label: 'Date' },
                    { key: 'time', label: 'Time' },
                    { key: 'name', label: 'Name' },
                    { key: 'status', label: 'Status' },
                    { key: 'location', label: 'Location' },
                    { key: 'confidence', label: 'Confidence' }
                  ].map(({ key, label }) => (
                    <th 
                      key={key}
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
                      onClick={() => requestSort(key)}
                    >
                      <div className="flex items-center">
                        {label}
                        <span className="ml-1">{getSortIcon(key)}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.status === 'Known' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.confidence ? `${log.confidence}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 text-lg">No logs found</p>
            <p className="text-gray-500 text-sm mt-2">
              {logs.length === 0 
                ? 'Recognition logs will appear here as faces are detected'
                : 'Try adjusting your filters'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination info */}
      {filteredLogs.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing {filteredLogs.length} of {logs.length} total logs
        </div>
      )}
    </div>
  );
};

export default LogsPage;