"use client";

import DashboardLayout from '@/components/dashboard/DashboardLayout'
import CreatePost from '@/components/posts/CreatePost'
import { useRouter } from 'next/navigation'
import React from 'react'

const CreatePostPage = () => {
  const router = useRouter();

  const handlePostCreated = (post: any) => {
    // Redirect to dashboard after successful post creation
    router.push('/dashboard');
  };

  const handleCancel = () => {
    // Navigate back to dashboard
    router.push('/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CreatePost
          onPostCreated={handlePostCreated}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  )
}

export default CreatePostPage