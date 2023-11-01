import React from 'react'
import styles from '@/components/homepage/forum.module.scss'
import forumdata from '@/data/homepage/forum.json'
import Link from 'next/link'

export default function Forum() {
  return (
    <>
      <div className="container">
        <div className={`${styles.sectionTitle} `}>FORUM</div>
      </div>
      <div className={`${styles.wrapper} row gx-5 container`}>
        {forumdata.map((v, i) => {
          return (
            <>
              <div
                key={i}
                className={`${styles.forum} col-4 d-flex flex-column`}
              >
                <div className={`${styles.viewMore}`}>VIEW MORE</div>
                <div>
                  <h1 className={`${styles.forumTitle}`}>{v.title}</h1>
                </div>
                <Link href={'/forum'}>
                  <div className={`${styles.imgWrapper}`}>
                    <img
                      className={`${styles.forumImg}`}
                      src={v.image}
                      alt=""
                    />
                  </div>
                </Link>
                <p className={`${styles.forumContent}`}>{v.description}</p>
                <span className={`${styles.tag}`}>#{v.tag}</span>
                <span className={`${styles.viewMore}`}>VIEW MORE</span>
              </div>
            </>
          )
        })}
      </div>
    </>
  )
}
