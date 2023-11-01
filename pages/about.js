import React from 'react'
import Image from 'next/image'
import Logo from '@/assets/wilk.png'

//assets 的方式引入圖片
export default function About() {
  return (
    <div>
      <Image src={Logo} alt="" />
    </div>
  )
}
