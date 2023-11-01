import { useState } from 'react'
import styles from '@/components/homepage/intro.module.scss'

export default function Intro() {
  const [show, setShow] = useState(false)
  const toggleShow = () => {
    setShow(!show)
  }

  return (
    <>
      <div className={`${styles.wrapper} row gx-5 justify-content-center`}>
        <div className="col-6 d-flex flex-column">
          <h1 className={`${styles.itroEngTitle}`}>BODER COLLIE</h1>
          <div className={`mt-auto mb-3`}>
            <h1 className={`${styles.itroTitle}`}>邊境牧羊犬</h1>
          </div>
          <p className={`${styles.introContent}`}>
            邊境牧羊犬並非一開始就存在，牠們的祖先是從
            {show ? (
              <div className={`${styles.info}`}>
                <i className="bi bi-megaphone-fill me-3"></i>
                即體型中等、毛髮不太長的蘇格蘭牧羊犬
              </div>
            ) : (
              ''
            )}
            <button className={`${styles.highlight} mx-1`} onClick={toggleShow}>
              <i className="bi bi-patch-question me-1"></i>柯利牧羊犬
            </button>
            中進化而來，除了愛爾蘭島以外，整個不列顛島都是邊牧的原產地，屬於英國的本土的犬種。
          </p>
        </div>
        <div className={`col-6 ${styles.picWrapper}`}>
          <img
            className={`${styles.itroPic}`}
            src="https://images.unsplash.com/photo-1547494912-c69d3ad40e7f?auto=format&fit=crop&q=80&w=3127&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
          />
          <div className={`${styles.nextBtn}`}>＞</div>
        </div>
      </div>
    </>
  )
}
