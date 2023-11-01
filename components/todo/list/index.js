import React from 'react'
import Item from './item'
import EditForm from './edit-form'
import styles from '../todo.module.css'

export default function List({
  todos,
  handdleToggleCompeleted,
  handdleRemove,
  handdleToggleEditing,
  handdleUpdateText,
}) {
  return (
    <>
      <div>
        {todos.map((v) => {
          {
            /* const{id, text, compeleted, editing}=v */
          }
          {
            /* 若 v.editing 為 true 則帶入 EditForm  */
          }
          return v.editing ? (
            <EditForm
              key={v.id}
              text={v.text}
              id={v.id}
              handdleUpdateText={handdleUpdateText}
            />
          ) : (
            <div className={`${styles['todoItems']} m-auto`}>
              <Item
                key={v.id}
                id={v.id}
                text={v.text}
                compeleted={v.compeleted}
                handdleRemove={handdleRemove}
                handdleToggleCompeleted={handdleToggleCompeleted}
                handdleToggleEditing={handdleToggleEditing}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}
