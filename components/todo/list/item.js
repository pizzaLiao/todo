import React from 'react'
import styles from '../todo.module.css'

export default function Item({
  id,
  text,
  compeleted,
  handdleRemove,
  handdleToggleCompeleted,
  handdleToggleEditing,
}) {
  return (
    <>
      <div
        className={` d-flex justify-content-between ${
          compeleted ? styles['todobar-compeleted'] : styles['todobar']
        }`}
      >
        <div>
          <input
            className="me-2"
            type="checkbox"
            checked={compeleted}
            onChange={() => {
              //toggle compeleted 狀態
              handdleToggleCompeleted(id)
            }}
          />
          <span
            onDoubleClick={() => {
              handdleToggleEditing(id)
            }}
            className={compeleted ? styles['compeleted'] : styles['active']}
          >
            {text}
          </span>
        </div>
        <div className="me-3">
          {/* REMOVE BUTTON */}
          <button
            className={styles['removebtn']}
            onClick={() => {
              handdleRemove(id)
            }}
          >
            <i class="bi bi-x-lg"></i>
          </button>
          {/* EDIT BUTTON */}
          <button
            className={styles['editbtn']}
            onClick={() => {
              handdleToggleEditing(id)
            }}
          >
            <i class="bi bi-pencil"></i>
          </button>
        </div>
      </div>
    </>
  )
}
