import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RouteErrorBoundary from "@/components/error/RouteErrorBoundary";
import { SearchPage } from "@/components/search";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Search({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialQuery = resolvedSearchParams.q || "";

  return (
    <RouteErrorBoundary routeName="Search">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Search</h1>
            <p className="text-muted-foreground">
              Find posts, users, and communities across the platform.
            </p>
          </div>

          <SearchPage initialQuery={initialQuery} />
        </div>
      </DashboardLayout>
    </RouteErrorBoundary>
  );
}