"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";

const DebugAuthPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const userData = typeof window !== 'undefined' ? localStorage.getItem("user") : null;

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Authentication Debug</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">useAuth State:</h2>
        <p>isLoading: {isLoading.toString()}</p>
        <p>isAuthenticated: {isAuthenticated.toString()}</p>
        <p>user: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">localStorage:</h2>
        <p>token: {token ? 'exists' : 'null'}</p>
        <p>userData: {userData ? userData : 'null'}</p>
      </div>

      {token && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Token Info:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {token}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugAuthPage;