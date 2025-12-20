import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Posts from '@/components/dashboard/Posts'
import React from 'react'

const page = () => {
  return (
    <DashboardLayout>
      <Posts />
    </DashboardLayout>
  )
}

export default page
