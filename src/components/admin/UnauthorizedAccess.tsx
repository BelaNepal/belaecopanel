import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UnauthorizedAccessProps {
  message?: string;
  requiredPermission?: string;
}

export default function UnauthorizedAccess({ message, requiredPermission }: UnauthorizedAccessProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6">
        <ShieldAlert className="w-16 h-16 text-red-500 dark:text-red-400" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Access Denied
      </h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mb-2">
        {message || "You do not have permission to view this page."}
      </p>
      
      {requiredPermission && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded border border-gray-200 dark:border-gray-700 font-mono">
          Missing Permission: {requiredPermission}
        </p>
      )}
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-8 max-w-md">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Need access?</strong> <br/>
          Please contact your system administrator to request the necessary permissions for your account.
        </p>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
        
        <Link 
          href="/admin"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-md shadow-primary/20"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
