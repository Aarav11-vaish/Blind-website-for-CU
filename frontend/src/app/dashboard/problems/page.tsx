import DashboardLayout from '@/components/dashboard/DashboardLayout'
import React from 'react'

const ProblemsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-6">
          <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
            Problems & Rants
          </h1>
          <p className="text-muted-foreground-light dark:text-muted-foreground-dark">
            Problem discussions and rants will be displayed here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProblemsPage