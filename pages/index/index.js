import React from 'react'
import Marquee from '@/components/homepage/marquee'
import Intro from '@/components/homepage/intro'
import Forum from '@/components/homepage/forum'

export default function index() {
  return (
    <>
      <Marquee />
      <Intro />
      <Forum />
    </>
  )
}
