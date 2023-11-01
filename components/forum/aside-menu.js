import React from 'react'
import Link from 'next/link'
import styles from '@/components/forum/aside-menu.module.scss'

export default function AsideMenu() {
  return (
    <div
      className={`${styles.asideMenu} d-flex flex-column text-center justify-content-between`}
    >
      <div className="d-flex flex-column">
        <img
          className={`${styles.userImg}`}
          src="https://images.unsplash.com/photo-1591768575198-88dac53fbd0a?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ></img>
        <span className={`${styles.account}`}>shinyu820</span>
        <Link href={`/forum/post`}>
          <button className="btn btn-dark mt-3">開始發文</button>
        </Link>
      </div>
      <div className="d-flex flex-column">
        <Link href={`/`} className={`${styles.go}`}>
          所有文章
        </Link>
        <Link href={`/`} className={`${styles.go}`}>
          認識狗狗
        </Link>
        <Link href={`/`} className={`${styles.go}`}>
          訓練狗狗
        </Link>
        <Link href={`/`} className={`${styles.go}`}>
          請益求救
        </Link>
        <Link href={`/`} className={`${styles.go}`}>
          介紹狗狗
        </Link>
        <Link href={`/`} className={`${styles.go}`}>
          好物開箱
        </Link>
      </div>
    </div>
  )
}
