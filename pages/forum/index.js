import React from 'react'
import { useRouter } from 'next/router'

export default function ForumIndex() {
  const router = useRouter()

  // 確認window(瀏覽器)開始運作
  if (typeof window !== 'undefined') {
    router.push('/forum/list')
  }

  return <></>
}
