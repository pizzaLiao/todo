/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from 'react'
import styles from './todo.module.css'

export default function AddForm({ doAdd }) {
  //宣告一個狀態專門給input表單使用
  const [inputValue, setInputValue] = useState('')
  return (
    <>
      {/* <input
        type="text"
        className="form-control"
        value={inputValue}
        onChange={(e) => {
          // console.log(e.target.value)
          setInputValue(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            doAdd(e.target.value)
            setInputValue('') //清空
          }
        }}
      /> */}
      <div className={`${styles['inputTodo']} m-auto`}>
        <input
          type="text"
          className="form-control"
          placeholder="輸入你的代辦事項"
          value={inputValue}
          onChange={(e) => {
            // console.log(e.target.value)
            setInputValue(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              doAdd(e.target.value)
              setInputValue('') //清空
            }
          }}
        />
      </div>
    </>
  )
}
