'use client';

import React, { useEffect, useState } from 'react';
import { systemAPI, logsAPI, auditAPI } from '@/lib/api';
import { useAuthStore } from '@/stores';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { 
  Activity, 
  Database, 
  Server, 
  Cpu, 
  HardDrive, 
  Save, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Folder, 
  RotateCcw, 
  Info, 
  XCircle, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Terminal, 
  Code, 
  List, 
  ShieldAlert,
  Users,
  Globe,
  Monitor,
  Mail,
  Key,
  Shield,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

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

interface SystemHealth {
  uptime: number;
  memory: {
    total: string;
    used: string;
    free: string;
    usagePercentage: string;
  };
  cpu: {
    loadAvg: number[];
    cores: number;
  };
  database: {
    status: string;
    latency: string;
  };
  system: {
    platform: string;
    release: string;
    hostname: string;
  };
}

interface BackupFile {
  name: string;
  size: string;
  createdAt: string;
}

interface SystemStats {
  users: number;
  products: number;
  orders: number;
  dealers: number;
  articles: number;
  logs: number;
}

interface LoginHistory {
  id: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export default function SystemPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'health' | 'maintenance' | 'logs' | 'advanced' | 'access'>('health');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Access Logs State
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessPage, setAccessPage] = useState(1);
  const [accessTotal, setAccessTotal] = useState(0);

  // Advanced Tab State
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [migrations, setMigrations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [executingQuery, setExecutingQuery] = useState(false);
  const [customPath, setCustomPath] = useState('');
  const [cleanupDays, setCleanupDays] = useState(30);

  // Logs State
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logsFilter, setLogsFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [logsLoading, setLogsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const [healthRes, statsRes] = await Promise.all([
        systemAPI.getHealth(),
        systemAPI.getStats()
      ]);
      setHealth(healthRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching health:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await systemAPI.getBackups();
      setBackups(res.data);
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await logsAPI.getAll();
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchAdvancedData = async () => {
    try {
      const [migRes, infoRes, tablesRes] = await Promise.all([
        systemAPI.getMigrations(),
        systemAPI.getSystemInfo(),
        systemAPI.getTables()
      ]);
      setMigrations(migRes.data);
      setSystemInfo(infoRes.data);
      setTables(tablesRes.data);
    } catch (error) {
      console.error('Error fetching advanced data:', error);
    }
  };

  const handleRunQuery = async () => {
    if (!sqlQuery.trim()) return;
    setExecutingQuery(true);
    setQueryError(null);
    setQueryResult(null);
    try {
      const res = await systemAPI.runQuery(sqlQuery);
      setQueryResult(res.data);
    } catch (error: any) {
      setQueryError(error.response?.data?.message || error.message);
    } finally {
      setExecutingQuery(false);
    }
  };

  const fetchLoginHistory = async () => {
    setAccessLoading(true);
    try {
      const res = await auditAPI.getLoginHistory({ page: accessPage, limit: 20 });
      setLoginHistory(res.data.data);
      setAccessTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Error fetching login history:', error);
    } finally {
      setAccessLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'health') fetchHealth();
    if (activeTab === 'maintenance') fetchBackups();
    if (activeTab === 'logs') fetchLogs();
    if (activeTab === 'advanced') fetchAdvancedData();
    if (activeTab === 'access') fetchLoginHistory();
  }, [activeTab, accessPage]);

  const toggleLog = (id: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLogs(newExpanded);
  };

  const getLevelIcon = (level: string, message?: string) => {
    switch (level) {
      case 'ERROR': return <XCircle className="text-red-500" size={18} />;
      case 'WARN': return <AlertTriangle className="text-yellow-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'WARN': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default: return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    }
  };

  const handleBackup = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await systemAPI.createBackup(customPath || undefined);
      alert('Backup created successfully!');
      fetchBackups();
      setCustomPath('');
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Backup failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm(`Are you sure you want to delete logs older than ${cleanupDays} days?`)) return;
    setLoading(true);
    try {
      const res = await systemAPI.cleanup(cleanupDays);
      alert(res.data.message);
    } catch (error) {
      console.error('Cleanup failed:', error);
      alert('Cleanup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this log?')) return;
    
    try {
      await logsAPI.delete(id);
      setLogs(logs.filter(log => log.id !== id));
    } catch (error) {
      console.error('Failed to delete log:', error);
      alert('Failed to delete log');
    }
  };

  const handleClearAllLogs = async () => {
    if (!confirm('DANGER: Are you sure you want to delete ALL system logs? This cannot be undone.')) return;
    
    setLogsLoading(true);
    try {
      await logsAPI.clearAll();
      setLogs([]);
      alert('All logs cleared successfully');
    } catch (error) {
      console.error('Failed to clear logs:', error);
      alert('Failed to clear logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleRestore = async (fileName: string) => {
    if (!confirm(`DANGER: This will overwrite the current database with the backup "${fileName}". This action cannot be undone. Are you sure?`)) return;
    
    // Double confirmation
    const confirmation = prompt(`Type "RESTORE" to confirm restoration of ${fileName}`);
    if (confirmation !== "RESTORE") return;

    setLoading(true);
    try {
      await systemAPI.restoreBackup(fileName);
      alert('Database restored successfully!');
      // Refresh health to check DB status
      fetchHealth();
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Restore failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const response = await systemAPI.downloadBackup(fileName);
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed.');
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading system data...</div>;
  }

  if (user && user.role !== 'ADMIN') {
      return <UnauthorizedAccess requiredPermission="ADMIN" />;
  }

  return (
    <div className="">
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 px-4 lg:px-8 py-6 mb-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Server className="w-6 h-6" />
          System Utilities
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2 rounded-none font-medium transition-colors ${
              activeTab === 'health' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            System Health
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2 rounded-none font-medium transition-colors ${
              activeTab === 'maintenance' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Maintenance
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-none font-medium transition-colors ${
              activeTab === 'logs' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            System Logs
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-2 rounded-none font-medium transition-colors ${
              activeTab === 'advanced' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Advanced
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`px-4 py-2 rounded-none font-medium transition-colors ${
              activeTab === 'access' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Access Logs
          </button>
        </div>
      </div>

      <div className="px-2">
      {activeTab === 'health' && health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* System Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
              <Server size={24} />
              <h3 className="font-bold text-lg">System Info</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Hostname:</span>
                <span className="font-medium dark:text-white">{health.system.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Platform:</span>
                <span className="font-medium dark:text-white">{health.system.platform} ({health.system.release})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Uptime:</span>
                <span className="font-medium dark:text-white">{formatUptime(health.uptime)}</span>
              </div>
            </div>
          </div>

          {/* Database */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
              <Database size={24} />
              <h3 className="font-bold text-lg">Database</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  health.database.status === 'CONNECTED' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {health.database.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Latency:</span>
                <span className="font-medium dark:text-white">{health.database.latency}</span>
              </div>
            </div>
          </div>

          {/* Memory */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
              <Activity size={24} />
              <h3 className="font-bold text-lg">Memory Usage</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: health.memory.usagePercentage }}></div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Used:</span>
                <span className="font-medium dark:text-white">{health.memory.used} / {health.memory.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Free:</span>
                <span className="font-medium dark:text-white">{health.memory.free}</span>
              </div>
            </div>
          </div>

          {/* Database Stats (New) */}
          {stats && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 col-span-1 md:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-3 mb-4 text-indigo-600 dark:text-indigo-400">
                <HardDrive size={24} />
                <h3 className="font-bold text-lg">Database Metrics</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.users}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Users</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.products}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Products</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.orders}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Orders</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.dealers}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Dealers</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.articles}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Articles</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats.logs}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Logs</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-8">
          {/* Backup Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white">
              <Save className="text-blue-500" />
              System Backup
            </h3>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom Backup Path (Optional - Server Side)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={customPath}
                      onChange={(e) => setCustomPath(e.target.value)}
                      placeholder="e.g. /mnt/backups/daily"
                      className="w-full pl-10 p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleBackup}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-none flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                Create Backup
              </button>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Backups (Local Storage)</h4>
              <div className="border border-gray-200 dark:border-gray-700 rounded-none overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="p-3 font-medium text-gray-600 dark:text-gray-300">Filename</th>
                      <th className="p-3 font-medium text-gray-600 dark:text-gray-300">Size</th>
                      <th className="p-3 font-medium text-gray-600 dark:text-gray-300">Created At</th>
                      <th className="p-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {backups.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">No backups found.</td>
                      </tr>
                    ) : (
                      backups.map((backup) => (
                        <tr key={backup.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="p-3 font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Database size={14} className="text-gray-400" />
                            {backup.name}
                          </td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">{backup.size}</td>
                          <td className="p-3 text-gray-600 dark:text-gray-400">
                            {format(new Date(backup.createdAt), 'MMM d, yyyy HH:mm')}
                          </td>
                          <td className="p-3 flex gap-2">
                            <button 
                              onClick={() => handleDownload(backup.name)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs flex items-center gap-1 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Download this backup"
                            >
                              <Download size={14} />
                              Download
                            </button>
                            <button 
                              onClick={() => handleRestore(backup.name)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs flex items-center gap-1 border border-red-200 dark:border-red-800 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Restore this backup"
                            >
                              <RotateCcw size={14} />
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                * Only the last 2 backups are kept in the default storage to save space.
              </p>
            </div>
          </div>

          {/* Cleanup Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white">
              <Trash2 className="text-red-500" />
              System Cleanup
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Delete logs older than
                </label>
                <select
                  value={cleanupDays}
                  onChange={(e) => setCleanupDays(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                >
                  <option value={7}>7 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={365}>1 Year</option>
                </select>
              </div>
              <button
                onClick={handleCleanup}
                disabled={loading}
                className="mt-6 px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-none flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Trash2 size={18} />}
                Clean Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-2">
              {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setLogsFilter(f); setCurrentPage(1); }}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                    logsFilter === f
                      ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
               <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
                />
              </div>
              <button 
                onClick={handleClearAllLogs}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                title="Clear All Logs"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={fetchLogs}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                title="Refresh Logs"
              >
                <RefreshCw size={20} className={logsLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 w-32">Level</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Message</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 w-48">Timestamp</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {logsLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Loading logs...</td>
                  </tr>
                ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">No logs found.</td>
                    </tr>
                ) : ((() => {
                    const filtered = logs.filter(log => {
                        const matchesFilter = logsFilter === 'ALL' || log.level === logsFilter;
                        const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchQuery.toLowerCase()));
                        return matchesFilter && matchesSearch;
                    });
                    
                    if (filtered.length === 0) {
                         return (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-500">No logs found matching criteria.</td>
                            </tr>
                         );
                    }

                    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                    const totalPages = Math.ceil(filtered.length / itemsPerPage);

                    return (
                        <>
                        {paginated.map((log) => (
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
                                <td className="p-4 align-top">
                                  <button
                                    onClick={(e) => handleDeleteLog(log.id, e)}
                                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    title="Delete Log"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            </React.Fragment>
                        ))}
                         {totalPages > 1 && (
                            <tr>
                                <td colSpan={4} className="p-4">
                                     <div className="flex justify-between items-center w-full">
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
                                </td>
                            </tr>
                        )}
                        </>
                    );
                  })()
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
          {/* SQL Runner */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
              <Terminal size={24} />
              <h3 className="font-bold text-lg">SQL Query Runner</h3>
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-2 p-3 mb-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md text-sm">
                <ShieldAlert size={18} />
                <span><strong>Warning:</strong> You are executing raw SQL queries. This can be dangerous. Proceed with caution.</span>
              </div>
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="SELECT * FROM User LIMIT 5;"
                className="w-full h-32 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSqlQuery('')}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleRunQuery}
                disabled={executingQuery || !sqlQuery.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {executingQuery ? <RefreshCw className="animate-spin" size={16} /> : <Code size={16} />}
                Execute Query
              </button>
            </div>
            
            {queryError && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-mono whitespace-pre-wrap">
                {queryError}
              </div>
            )}

            {queryResult && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Result:</h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {Array.isArray(queryResult) && queryResult.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            {Object.keys(queryResult[0]).map((key) => (
                              <th key={key} className="p-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {queryResult.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-800/50">
                              {Object.values(row).map((val: any, j: number) => (
                                <td key={j} className="p-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-gray-500 font-mono">
                      {JSON.stringify(queryResult, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Database Tables */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                <Database size={24} />
                <h3 className="font-bold text-lg">Database Tables</h3>
              </div>
              <div className="overflow-y-auto max-h-96">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                    <tr>
                      <th className="p-3 font-semibold text-gray-600 dark:text-gray-300">Table Name</th>
                      <th className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-right">Rows (Est)</th>
                      <th className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-right">Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {tables.map((table: any) => (
                      <tr key={table.tableName} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="p-3 font-mono text-xs text-gray-700 dark:text-gray-300 font-medium">
                          {table.tableName}
                        </td>
                        <td className="p-3 text-gray-500 dark:text-gray-400 text-right text-xs">
                          {Number(table.rowCount).toLocaleString()}
                        </td>
                        <td className="p-3 text-gray-500 dark:text-gray-400 text-right text-xs">
                          {table.totalSize}
                        </td>
                      </tr>
                    ))}
                    {tables.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-gray-500">No tables found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Migrations */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
                <List size={24} />
                <h3 className="font-bold text-lg">Migration History</h3>
              </div>
              <div className="overflow-y-auto max-h-96">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                    <tr>
                      <th className="p-3 font-semibold text-gray-600 dark:text-gray-300">Migration Name</th>
                      <th className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-right">Applied At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {migrations.map((mig: any) => (
                      <tr key={mig.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="p-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                          {mig.migration_name}
                        </td>
                        <td className="p-3 text-gray-500 dark:text-gray-400 text-right text-xs">
                          {mig.finished_at ? format(new Date(mig.finished_at), 'MMM d, yyyy HH:mm') : 'Pending'}
                        </td>
                      </tr>
                    ))}
                    {migrations.length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-gray-500">No migrations found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4 text-gray-600 dark:text-gray-400">
                <Info size={24} />
                <h3 className="font-bold text-lg">Environment Info</h3>
              </div>
              {systemInfo ? (
                <div className="space-y-3">
                  {Object.entries(systemInfo).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded break-all max-w-[60%] text-right">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">Loading info...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'access' && (
        <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
              <Users size={24} />
              <h3 className="font-bold text-lg">User Login History</h3>
            </div>
            <button 
              onClick={fetchLoginHistory}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} className={accessLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">User</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Role</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">IP Address</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">User Agent</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {accessLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">Loading history...</td>
                  </tr>
                ) : loginHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No login history found.</td>
                  </tr>
                ) : (
                  loginHistory.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {log.user.firstName} {log.user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{log.user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {log.user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Globe size={14} />
                          {log.ipAddress || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 max-w-xs truncate" title={log.userAgent}>
                          <Monitor size={14} />
                          <span className="truncate">{log.userAgent || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          log.status === 'SUCCESS' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {loginHistory.length} of {accessTotal} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAccessPage(p => Math.max(1, p - 1))}
                disabled={accessPage === 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setAccessPage(p => p + 1)}
                disabled={loginHistory.length < 20}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
