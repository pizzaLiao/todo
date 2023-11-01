/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from 'react'
import styles from '@/components/layout/navbar.module.scss'
import Link from 'next/link'

export default function Navbar() {
  const [showSign, setShowSign] = useState(false)
  const toggleShow = () => {
    setShowSign(!showSign)
  }
  return (
    <>
      <div
        className={`container-fluid d-flex justify-content-between ${styles.bar}`}
      >
        <div className={`${styles.menu}`}>
          <i class="bi bi-list fs-4"></i>
        </div>
        <Link href={`/index`}>
          <div className={`${styles.title}`}>WOOF</div>
        </Link>
        <div>
          <button
            className={`d-inline-block ${styles.sign}`}
            onClick={toggleShow}
          >
            SIGN IN / UP
          </button>
          <i class="bi bi-person-circle ms-3 me-5"></i>
        </div>
      </div>
      {showSign ? (
        <div className={`${styles.signPop}`}>
          <label htmlFor="">ACCOUNT</label> <br />
          <input type="text" />
          <br />
          <label htmlFor="">PASSWORD</label> <br />
          <input type="text" />
        </div>
      ) : (
        ''
      )}
    </>
  )
}
