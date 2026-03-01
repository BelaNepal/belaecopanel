'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useThemeStore, useAdminStore } from '@/stores';
import {
  BarChart3,
  Package,
  Users,
  Briefcase,
  ShoppingCart,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  MessageSquare,
  Mail,
  Server,
  ChevronDown,
  ChevronUp,
  Settings,
  Trash2,
  Megaphone,
  Globe,
} from 'lucide-react';

import NotificationBell from '@/components/admin/NotificationBell';

const Typewriter = ({ text, speed = 100 }: { text: string; speed?: number }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        i++;
        setDisplayText(text.substring(0, i));
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayText}</span>;
};

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles: string[];
  vertical?: 'ECOPANELS' | 'MODULARHOMES';
  subItems?: MenuItem[];
  permission?: string; // Add permission field
}

const adminMenuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <BarChart3 size={20} />, href: '/admin', roles: ['ADMIN', 'STAFF', 'DEALER', 'CONTRACTOR', 'ENGINEER'], permission: 'canViewDashboard' },
  
  // User Management Group
  {
    label: 'Users',
    icon: <Users size={20} />,
    href: '#',
    roles: ['ADMIN', 'STAFF'],
    subItems: [
      { label: 'Customers', icon: <Users size={18} />, href: '/admin/customers', roles: ['ADMIN', 'STAFF'], permission: 'canManageCustomers' },
      { label: 'Engineers', icon: <Users size={18} />, href: '/admin/dealers?role=ENGINEER', roles: ['ADMIN', 'STAFF'], vertical: 'MODULARHOMES', permission: 'canManageEngineers' },
      { label: 'Admin', icon: <Users size={18} />, href: '/admin/staff?role=ADMIN', roles: ['ADMIN'], permission: 'canManageStaff' },
      { label: 'Contractors', icon: <Users size={18} />, href: '/admin/dealers?role=CONTRACTOR', roles: ['ADMIN', 'STAFF'], vertical: 'MODULARHOMES', permission: 'canManageContractors' },
      { label: 'Dealers', icon: <Briefcase size={18} />, href: '/admin/dealers', roles: ['ADMIN', 'STAFF'], vertical: 'ECOPANELS', permission: 'canManageDealers' },
      { label: 'Staff', icon: <Users size={18} />, href: '/admin/staff', roles: ['ADMIN', 'STAFF'], permission: 'canManageStaff' },
    ]
  },

  { label: 'Products', icon: <Package size={20} />, href: '/admin/products', roles: ['ADMIN', 'STAFF', 'DEALER', 'CONTRACTOR', 'ENGINEER'], permission: 'canViewProducts' },
  
  // Modular Homes Only - Projects
  { label: 'Projects', icon: <Briefcase size={20} />, href: '/admin/projects', roles: ['ADMIN', 'CONTRACTOR', 'ENGINEER'], vertical: 'MODULARHOMES', permission: 'canViewProjects' },

  { label: 'Orders', icon: <ShoppingCart size={20} />, href: '/admin/orders', roles: ['ADMIN', 'STAFF', 'DEALER'], permission: 'canViewOrders' }, // changed from canManageOrders
  { label: 'Quotations', icon: <FileText size={20} />, href: '/admin/quotations', roles: ['ADMIN', 'STAFF', 'DEALER'], permission: 'canViewQuotations' },
  { label: 'Mail Center', icon: <Mail size={20} />, href: '/admin/mail', roles: ['ADMIN', 'STAFF'], permission: 'canAccessMail' },
  { label: 'Articles', icon: <FileText size={20} />, href: '/admin/articles', roles: ['ADMIN', 'STAFF'], permission: 'canManageArticles' },
  { label: 'Testimonials', icon: <MessageSquare size={20} />, href: '/admin/testimonials', roles: ['ADMIN', 'STAFF'], permission: 'canManageTestimonials' },
  { label: 'FAQs', icon: <HelpCircle size={20} />, href: '/admin/faqs', roles: ['ADMIN', 'STAFF'], permission: 'canManageFAQs' },
  { label: 'Popups', icon: <Megaphone size={20} />, href: '/admin/popups', roles: ['ADMIN', 'STAFF'], permission: 'canManagePopups' },
  { label: 'Newsletters', icon: <Users size={20} />, href: '/admin/newsletters', roles: ['ADMIN'], permission: 'canManageNewsletters' },
  { label: 'System Utilities', icon: <Server size={20} />, href: '/admin/system', roles: ['ADMIN'], permission: 'canManageSystem' },
  { label: 'Trash', icon: <Trash2 size={20} />, href: '/admin/trash', roles: ['ADMIN'], permission: 'canManageSystem' },
  {
    label: 'Settings',
    icon: <Settings size={20} />,
    href: '#',
    roles: ['ADMIN'],
    permission: 'canManageSystem',
    subItems: [
      { label: 'Permissions', icon: <Users size={18} />, href: '/admin/settings/permissions', roles: ['ADMIN'], permission: 'canManageUsers' },
    ]
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user, checkAuth } = useAuthStore();
  const { isDark, toggleDark } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [mounted, setMounted] = useState(false);
  const { activeVertical, setActiveVertical } = useAdminStore();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Polling for Permissions Updates (Every 15s)
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        checkAuth(); // Refetch user profile (with latest permissions)
      }, 15000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  // Force Modular Homes vertical for Contractors and Engineers
  useEffect(() => {
    if (user?.role === 'CONTRACTOR' || user?.role === 'ENGINEER') {
      if (activeVertical !== 'MODULARHOMES') {
        setActiveVertical('MODULARHOMES');
      }
    }
  }, [user, activeVertical, setActiveVertical]);

  // Auto-switch vertical based on path
  useEffect(() => {
    if (pathname.startsWith('/admin/projects')) {
      if (activeVertical !== 'MODULARHOMES') setActiveVertical('MODULARHOMES');
    }
  }, [pathname, activeVertical, setActiveVertical]);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Handle responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const toggleSubMenu = (label: string) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Filter menu items based on user role, active vertical, and permissions
  const filteredMenuItems = React.useMemo(() => {
    if (!mounted || !user) return [];

    const hasPermission = (permissionKey?: string) => {
      // Admins have all permissions implicitly, unless we want to restrict them too for testing.
      // But typically ADMIN role overrides granular flags.
      // However, if we want "granular... for any role", we should check permissions for ADMIN too?
      // User request: "for every roles and for custom users".
      // Let's assume ADMIN has full access, but we can respect flags if present?
      // Standard practice: ADMIN role = superuser. Custom permissions = overrides for lower roles.
      if (user.role === 'ADMIN') return true;
      if (!permissionKey) return true; // No permission required
      return !!(user.permissions && user.permissions[permissionKey]);
    };

    const filterItem = (item: MenuItem): MenuItem | null => {
      // 1. Vertical Check
      if (item.vertical && item.vertical !== activeVertical) return null;

      // 2. Role Check (Basic safety)
      if (!item.roles.includes(user.role)) return null;

      // 3. Permission Check
      if (!hasPermission(item.permission)) return null;

      // 4. Sub-items Processing
      let newItem = { ...item };
      if (item.subItems) {
        const validSubItems = item.subItems
          .map(filterItem)
          .filter((sub): sub is MenuItem => sub !== null);

        // If parent has children but all are filtered out, hide parent
        // UNLESS parent is a direct link itself (not just a grouper)
        if (validSubItems.length === 0 && item.href === '#') {
          return null;
        }
        newItem.subItems = validSubItems;
      }

      return newItem;
    };

    const filteredItems = adminMenuItems
      .map(filterItem)
      .filter((item): item is MenuItem => item !== null);

    // Map Dashboard Href based on role
    return filteredItems.map(item => {
        if (item.label === 'Dashboard') {
           let newHref = '/admin';
           if (user.role === 'ENGINEER') newHref = '/admin/engineers/dashboard';
           else if (user.role === 'CONTRACTOR') newHref = '/admin/contractors/dashboard';
           else if (user.role === 'DEALER') newHref = '/admin/dealers/dashboard';
           else if (user.role === 'STAFF' || user.role === 'ADMIN') newHref = '/admin/dashboard';
           
           return { ...item, href: newHref };
        }
        return item;
    });
  }, [mounted, user, activeVertical]);

  // If on login page, render children directly without layout
  if (pathname.includes('/admin/login')) {
    return <>{children}</>;
  }

  const hideSidebar = mounted && (user?.role === 'ENGINEER' || user?.role === 'CONTRACTOR');

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Mobile Overlay */}
      {mobileMenuOpen && !hideSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!hideSidebar && (
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          bg-white dark:bg-gray-800 text-gray-800 dark:text-white 
          transition-all duration-300 shadow-xl border-r border-gray-200 dark:border-gray-700
          flex flex-col h-screen
          ${mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'lg:w-72' : 'lg:w-20'}
        `}
      >
        {/* Logo Area / User Info */}
        <div className={`flex flex-col items-center justify-center border-b border-gray-100 dark:border-gray-700 relative transition-all duration-300 ${sidebarOpen || mobileMenuOpen ? 'py-4 px-2' : 'py-4 px-2'}`}>
          
          {/* User Info in place of Logo */}
          {!mounted ? (
            <div className="flex flex-col items-center w-full">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse mb-2"></div>
              {(sidebarOpen || mobileMenuOpen) && (
                <>
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse mb-1 rounded"></div>
                  <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                </>
              )}
            </div>
          ) : (sidebarOpen || mobileMenuOpen) ? (
            <div className="text-center w-full">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-lg"
                style={{ backgroundColor: '#ef7e1a' }}
              >
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="font-bold text-gray-800 dark:text-white truncate text-sm min-h-[1.25rem] flex items-center justify-center">
                 <Typewriter text={`${greeting}, ${user?.firstName}`} speed={80} />
              </div>
              <p className="text-[10px] text-primary font-medium mt-0.5 capitalize bg-primary/10 py-0.5 px-2 rounded-full inline-block">
                {user?.role?.toLowerCase()}
              </p>
            </div>
          ) : (
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: '#ef7e1a' }}
            >
              {user?.firstName?.charAt(0)}
            </div>
          )}

          {/* Desktop Toggle */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex absolute -right-3 top-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full p-1 shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition"
          >
            {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          </button>

          {/* Mobile Close */}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden absolute right-2 top-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Vertical Switcher - Only for Admin/Staff */}
        {mounted && (user?.role === 'ADMIN' || user?.role === 'STAFF') && (
          <div className={`transition-all duration-300 py-3 border-b border-gray-100 dark:border-gray-700 ${sidebarOpen || mobileMenuOpen ? 'px-4' : 'px-2 flex justify-center'}`}>
            
             {(sidebarOpen || mobileMenuOpen) ? (
                <div className="relative p-1 bg-gray-100 dark:bg-gray-900/50 rounded-xl flex items-center shadow-inner border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Sliding Background */}
                  <div 
                    className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white dark:bg-gray-700 shadow-md rounded-lg transition-all duration-300 ease-out border border-gray-100 dark:border-gray-600 ${
                      activeVertical === 'MODULARHOMES' ? 'left-[50%]' : 'left-1'
                    }`}
                  ></div>
                  
                  <button
                    onClick={() => setActiveVertical('ECOPANELS')}
                    className={`relative flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-[10px] font-bold tracking-wider transition-colors z-10 ${
                      activeVertical === 'ECOPANELS' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'
                    }`}
                  >
                    <Package size={14} className={activeVertical === 'ECOPANELS' ? 'animate-pulse' : ''} />
                    ECO PANELS
                  </button>
                  <button
                    onClick={() => setActiveVertical('MODULARHOMES')}
                    className={`relative flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-[10px] font-bold tracking-wider transition-colors z-10 ${
                      activeVertical === 'MODULARHOMES' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'
                    }`}
                  >
                    <Home size={14} />
                    MODULAR
                  </button>
                </div>
             ) : (
                // Compact Mode
                <button
                  onClick={() => setActiveVertical(activeVertical === 'ECOPANELS' ? 'MODULARHOMES' : 'ECOPANELS')}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 active:scale-95 ${
                     activeVertical === 'ECOPANELS' 
                       ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border border-green-200 dark:from-green-900/30 dark:to-green-900/10 dark:border-green-800 dark:text-green-400' 
                       : 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border border-blue-200 dark:from-blue-900/30 dark:to-blue-900/10 dark:border-blue-800 dark:text-blue-400'
                  }`}
                  title={`Current: ${activeVertical === 'ECOPANELS' ? 'Eco Panels' : 'Modular Homes'} (Click to switch)`}
                >
                  {activeVertical === 'ECOPANELS' ? <Package size={20} /> : <Home size={20} />}
                </button>
             )}
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedMenus[item.label];
            const isChildActive = hasSubItems && item.subItems?.some(sub => pathname === sub.href || (sub.href.includes('?') && pathname + window.location.search === sub.href));

            if (hasSubItems) {
              return (
                <div key={item.label} className="mb-1">
                  <button
                    onClick={() => toggleSubMenu(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isChildActive
                        ? 'bg-gray-100 dark:bg-gray-700/50 text-primary dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-primary dark:hover:text-white'
                    }`}
                    title={!sidebarOpen && !mobileMenuOpen ? item.label : ''}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isChildActive ? 'text-primary dark:text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-white'}`}>
                        {item.icon}
                      </div>
                      {(sidebarOpen || mobileMenuOpen) && <span className="font-medium text-sm">{item.label}</span>}
                    </div>
                    {(sidebarOpen || mobileMenuOpen) && (
                      <div className="text-gray-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {isExpanded && (sidebarOpen || mobileMenuOpen) && (
                    <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 mt-1 space-y-1">
                      {item.subItems
                        ?.filter(subItem => !subItem.vertical || subItem.vertical === activeVertical)
                        .map((subItem) => {
                        const isSubActive = pathname === subItem.href || (subItem.href.includes('?') && pathname + window.location.search === subItem.href);
                        return (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                              isSubActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'
                            }`}
                          >
                            <span>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-primary dark:hover:text-white'
                }`}
                title={!sidebarOpen && !mobileMenuOpen ? item.label : ''}
              >
                <div className={`${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-white'}`}>
                  {item.icon}
                </div>
                {(sidebarOpen || mobileMenuOpen) && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 ${(!sidebarOpen && !mobileMenuOpen) && 'justify-center'}`}
            title="Logout"
          >
            <LogOut size={20} />
            {(sidebarOpen || mobileMenuOpen) && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${!hideSidebar ? (sidebarOpen ? 'lg:ml-72' : 'lg:ml-20') : ''}`}>
        {/* Top Bar */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-800/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {!hideSidebar && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <Menu size={24} />
              </button>
              )}
              <h1 className="text-lg font-semibold lg:hidden">Admin Portal</h1>
            </div>

            {/* Center Heading */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
              <Link href="/admin" className="flex items-center gap-3">
                <img src="/Logo-Bela.png" alt="Logo" className="h-14 w-auto" />
                <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-wide">
                  Bela Nepal Industries Private Limited
                </h1>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />
              
              <button
                onClick={toggleDark}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-600 dark:text-gray-300"
                title={mounted && isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {mounted && isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {activeVertical === 'ECOPANELS' && (
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-600 dark:text-gray-300"
                  title="Go to Eco Panels Website"
                >
                  <Home size={18} />
                  <span className="hidden sm:inline text-sm font-medium">Eco Panels</span>
                </Link>
              )}
              
              {activeVertical === 'MODULARHOMES' && (
                <Link
                  href="http://localhost:8080"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-600 dark:text-gray-300"
                  title="Go to Modular Homes Website"
                >
                  <Globe size={18} />
                  <span className="hidden sm:inline text-sm font-medium">Modular Homes</span>
                </Link>
              )}

              {/* Main Dashboard Button for Engineers/Contractors */}
              {mounted && (user?.role === 'ENGINEER' || user?.role === 'CONTRACTOR') && (
                <Link
                  href={user.role === 'ENGINEER' ? '/admin/engineers/dashboard' : '/admin/contractors/dashboard'}
                  className="hidden sm:flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-md rounded-full transition-all duration-300 group"
                  title="Go to Main Dashboard"
                >
                  <div className="p-1.5 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white rounded-full transition-colors">
                    <BarChart3 size={16} />
                  </div>
                  <div className="flex flex-col items-start justify-center h-full">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest leading-none mb-0.5">Dashboard</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-none">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                </Link>
              )}

              {hideSidebar && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut size={20} />
                  <span className="hidden sm:inline text-sm">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
