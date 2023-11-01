import React from 'react'
import styles from '@/components/homepage/marquee.module.scss'

export default function Marquee() {
  return (
    <div className="d-flex justify-content-center">
      <div className={`${styles.marqueeContainer}`}>
        <div className={`${styles.marqueeContent}`}>
          WOOF WOOF WOOF WOOF WOOF WOOF{' '}
        </div>
        <div className={`${styles.marqueeContent2}`}>
          WOOF WOOF WOOF WOOF WOOF WOOF{' '}
        </div>
        <div className={`${styles.marqueeContent3}`}>
          WOOF WOOF WOOF WOOF WOOF WOOF{' '}
        </div>
      </div>
    </div>
  )
}
