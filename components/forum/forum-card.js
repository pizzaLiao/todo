import React from 'react'
import styles from '@/components/forum/forum-card.module.scss'
import forums from '@/data/forum/forum-post.json'

export default function ForumCard() {
  return (
    <>
      {forums.map((v, i) => {
        return (
          <>
            <div key={i} className={`container row ${styles.card}`}>
              <div className="col">
                <div className="d-flex align-items-center">
                  <div className={`${styles.sorting}`}>分享</div>
                  <div className={`${styles.hashtag}`}>#寵物美容</div>
                </div>
                <h1 className={`${styles.title}`}>
                  寵物美容小知識：雪白精靈瑪爾濟斯
                </h1>
                <span className={`${styles.time}`}>2023/11/05</span>
                <p className={`${styles.content}`}>
                  每隻狗狗都是獨一無二的存在，即使品種相同，其性格、體質、骨架與細微的身體構造等都不一樣，進而使他們在日常生活中擁有全然不同的表現。寵愛你的寶貝，添新衣、買新帽只是基本款，美容造型更是不可少！但在為他們打造新面貌之前，別忘了深入了解毛孩的各種特徵，並與美容師詳細溝通，才能設計出最適合他們的造型喔！《哈寵誌》就帶你進入小狗狗的美容世界，由專業級的寵物美容師帶路，為你掌握「瑪爾濟斯」的美容需求！
                </p>
                <div className={`d-flex ${styles.inter}`}>
                  <div className={`${styles.like}`}>
                    <i className={`bi bi-heart-fill ${styles.icon}`}></i>115
                  </div>
                  <div className={`${styles.like}`}>
                    <i className={`bi bi-chat-dots-fill ${styles.icon}`}></i>23
                  </div>
                </div>
              </div>
              <div className="col-auto d-flex align-items-center ">
                <div className={`${styles.postWrapper}`}>
                  <img
                    className={`${styles.postImg}`}
                    src="https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?auto=format&fit=crop&q=80&w=1978&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </>
        )
      })}
    </>
  )
}
