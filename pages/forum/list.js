import React from 'react'
import AsideMenu from '@/components/forum/aside-menu'
import ForumCard from '@/components/forum/forum-card'

export default function ForumList() {
  return (
    <div className="d-flex justify-content-center">
      <div className="container row">
        <div className="col-lg-2 col-4">
          <AsideMenu />
        </div>
        <div className="col-lg-10 col-8">
          <ForumCard />
        </div>
      </div>
    </div>
  )
}
