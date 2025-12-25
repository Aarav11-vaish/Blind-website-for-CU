import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Posts from '@/components/dashboard/Posts'
import RouteErrorBoundary from '@/components/error/RouteErrorBoundary'
import React from 'react'

const page = () => {
  return (
    <RouteErrorBoundary routeName="Dashboard Home">
      <DashboardLayout>
        <Posts />
      </DashboardLayout>
    </RouteErrorBoundary>
  )
}

export default page
