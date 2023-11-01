import React, { useState } from 'react'
import styles from '../todo.module.css'

export default function EditForm({ id, text, handdleUpdateText }) {
  const [inputText, setInputText] = useState(text)
  return (
    <div className="d-flex justify-content-center align-items-center">
      <input
        className={`${styles['input-focus']} form-control`}
        type="text"
        // autoFocus
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handdleUpdateText(id, inputText)
          }
        }}
      />
      <button
        className={`${styles['editbtn']} ms-3`}
        onClick={() => {
          handdleUpdateText(id, inputText)
        }}
      >
        <i class="bi bi-floppy"></i>
      </button>
    </div>
  )
}
