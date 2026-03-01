'use client';

import React, { useEffect, useState } from 'react';
import { logsAPI } from '@/lib/api';
import { useAuthStore } from '@/stores';
import { useRouter } from 'next/navigation';
import { Activity, AlertTriangle, Info, XCircle, RefreshCw, ChevronDown, ChevronRight, Trash2, Search, Mail, Key, Shield, FileText } from 'lucide-react';
import { format } from 'date-fns';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  metadata: any;
  createdAt: string;
}

const JsonViewer = ({ data }: { data: any }) => {
  if (!data) return null;
  
  // If it's a string that looks like JSON, try to parse it
  let displayData = data;
  if (typeof data === 'string') {
    try {
      displayData = JSON.parse(data);
    } catch (e) {
      // Not JSON
    }
  }

  return (
    <div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-md p-3 text-xs font-mono overflow-x-auto border border-gray-200 dark:border-gray-700">
      <pre className="text-gray-700 dark:text-gray-300">
        {JSON.stringify(displayData, null, 2)}
      </pre>
    </div>
  );
};

export default function SystemLogsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const toggleLog = (id: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLogs(newExpanded);
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to delete all logs? This action cannot be undone.')) return;
    
    try {
      await logsAPI.clearAll();
      fetchLogs();
    } catch (error) {
      console.error('Error clearing logs:', error);
      alert('Failed to clear logs');
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await logsAPI.getAll();
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50';
      case 'WARN': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-900/50';
      default: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50';
    }
  };

  const getLevelIcon = (level: string, message: string) => {
    const lowerMsg = message?.toLowerCase() || '';
    
    if (level === 'ERROR') return <XCircle className="text-red-500" size={18} />;
    if (level === 'WARN') return <AlertTriangle className="text-yellow-500" size={18} />;
    
    // Context aware icons for INFO
    if (lowerMsg.includes('mail') || lowerMsg.includes('email')) return <Mail className="text-blue-500" size={18} />;
    if (lowerMsg.includes('login') || lowerMsg.includes('auth')) return <Key className="text-purple-500" size={18} />;
    if (lowerMsg.includes('security') || lowerMsg.includes('permission')) return <Shield className="text-green-500" size={18} />;
    
    return <Info className="text-blue-500" size={18} />;
  };

  const filteredLogs = logs.filter(log => {
      const matchesFilter = filter === 'ALL' || log.level === filter;
      const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!loading && (!user || user.role !== 'ADMIN')) {
    return <UnauthorizedAccess requiredPermission="ADMIN" />;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6" />
            System Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor system activities, emails, and errors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
           <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
            />
          </div>
          <button 
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
            title="Clear All Logs"
          >
            <Trash2 size={16} />
            Clear
          </button>
          <button 
            onClick={fetchLogs}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-2 overflow-x-auto">
          {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCurrentPage(1); }}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                filter === f
                  ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 w-32">Level</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Message</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 w-48">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">Loading logs...</td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">No logs found matching your criteria.</td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer ${expandedLogs.has(log.id) ? 'bg-gray-50 dark:bg-gray-700/30' : ''}`}
                      onClick={() => toggleLog(log.id)}
                    >
                      <td className="p-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelClass(log.level)}`}>
                          {getLevelIcon(log.level, log.message)}
                          {log.level}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-start gap-2">
                          <div className="mt-1 text-gray-400">
                            {expandedLogs.has(log.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 dark:text-gray-200">{log.message}</div>
                            {expandedLogs.has(log.id) && log.metadata && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <JsonViewer data={log.metadata} />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap align-top text-xs">
                        {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(c => c - 1)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                </div>
                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(c => c + 1)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        )}
      </div>
    </div>
  );
}