'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, ShoppingCart, Briefcase, Trash2, X, ExternalLink } from 'lucide-react';
import { notificationAPI } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';
import { socket } from '@/lib/socket';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const lastIdRef = useRef<string | null>(null);
  const isFirstLoad = useRef<boolean>(true);

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle size={16} className="text-green-500" />;
      case 'WARNING': return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'ERROR': return <XCircle size={16} className="text-red-500" />;
      case 'ORDER': return <ShoppingCart size={16} className="text-blue-500" />;
      case 'DEALER': return <Briefcase size={16} className="text-purple-500" />;
      case 'PROJECT': return <Briefcase size={16} className="text-indigo-500" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll({ take: 5, unreadOnly: 'false' }); 
      const latest = res.data.data[0];
      const newItems = res.data.data;
      
      // Modern Toasts for New Items
      if (!isFirstLoad.current && latest && latest.id !== lastIdRef.current) {
        // Find all new items since last ID
        const newNotifications = [];
        for (const item of newItems) {
            if (item.id === lastIdRef.current) break;
            newNotifications.push(item);
        }

        // Show toast for each new notification (limit to 3 to avoid spam)
        newNotifications.slice(0, 3).forEach(n => {
             toast(n.title, {
                description: n.message,
                icon: getIcon(n.type),
                action: {
                    label: 'View',
                    onClick: () => window.location.href = n.link || '/admin/notifications'
                },
                duration: 5000,
             });
        });
      }

      setNotifications(res.data.data);
      setUnreadCount(res.data.pagination.unreadCount);
      
      if (latest) {
          lastIdRef.current = latest.id;
      }
      isFirstLoad.current = false;

    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    if (user) {
        // Initial fetch
        fetchNotifications();

        // Connect to socket
        if (!socket.connected) {
            socket.connect();
        }
        
        socket.on('connect', () => {
            socket.emit('join_room', `user_${user.id}`);
            
            // Join admin room for system-wide notifications
            if (user.role === 'ADMIN' || user.role === 'STAFF') {
                 socket.emit('join_room', 'admin');
            }
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        socket.on('new_notification', (data) => {
            // Play sound optionally
            // const audio = new Audio('/notification.mp3'); 
            // audio.play().catch(e => console.log('Audio play failed', e));

            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);

            toast(data.title, {
                description: data.message,
                icon: getIcon(data.type),
                action: {
                    label: 'View',
                    onClick: () => window.location.href = data.link || '/admin/notifications'
                },
                duration: 5000,
            });
        });

        return () => {
             socket.off('new_notification');
             // We generally keep the socket open, but removing the listener is good practice
        };
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // If it was unread, decrement count
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification removed');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800 px-1 animate-in zoom-in duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={notification.link || '#'} 
                          onClick={(e) => {
                            setIsOpen(false);
                            if (!notification.isRead) {
                                handleMarkAsRead(notification.id, e);
                            }
                          }}
                          className="block"
                        >
                          <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1.5">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </Link>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-none transition-all"
                            title="Mark as read"
                          >
                            <Check size={12} className="text-gray-500" />
                          </button>
                        )}
                        <button
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-none transition-all text-gray-400 hover:text-red-500"
                            title="Delete"
                        >
                            <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
            <Link 
              href="/admin/notifications" 
              className="text-xs text-gray-500 hover:text-primary transition-colors block py-1"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
