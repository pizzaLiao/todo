import { useState } from 'react'
// import styles from './todo.module.css'
import AddForm from './add-form'
import List from './list/index'
import styles from './todo.module.css'

export default function TodoIndex() {
  //*宣告狀態
  //每個todo {id:number, text:string}
  const [todos, setTodos] = useState([
    {
      id: 1,
      text: '買牛奶',
      compeleted: true,
      editing: false,
    },
    {
      id: 2,
      text: '運動',
      compeleted: false,
      editing: false,
    },
  ])
  //全選專用的狀態
  const [selectedAll, setSelectedAll] = useState(false)
  //   過濾類型用的狀態 枚舉、列舉 ，值只能是三者之一 「所有」「進行中」「已完成」
  const [filterType, setFilterType] = useState('所有')
  const filterOption = ['所有', '進行中', '已完成']

  //*執行函示

  //注意：更新完成後editing要改為false
  const updateText = (todos, id, text) => {
    return todos.map((v) => {
      if (v.id === id) return { ...v, text: text, editing: false }
      else return { ...v }
    })
  }

  const handdleUpdateText = (id, text) => {
    setTodos(updateText(todos, id, text))
  }

  const filterByType = (todos, filterType) => {
    if (filterType === '已完成') {
      return todos.filter((v) => v.compeleted === true)
    }
    if (filterType === '進行中') {
      return todos.filter((v) => v.compeleted === false)
    }
    //所有
    return todos
  }

  //同一個時間只讓一個值進入編輯狀態
  const toggleEditing = (todos, id) => {
    return todos.map((v) => {
      if (v.id === id) return { ...v, editing: !v.editing }
      else return { ...v, editing: false }
    })
  }

  const handdleToggleEditing = (id) => {
    setTodos(toggleEditing(todos, id))
  }

  //新增一個 isSelectedAll 變數去儲存 compeleted （全選）的狀態
  const toggleselectedAll = (todos, isSelectedAll = false) => {
    return todos.map((v) => {
      return { ...v, compeleted: isSelectedAll }
    })
  }

  const handdleToggleselectedAll = (isSelectedAll) => {
    setTodos(toggleselectedAll(todos, isSelectedAll))
  }

  const remove = (todos, id) => {
    return todos.filter((v) => v.id !== id)
  }

  const handdleRemove = (id) => {
    setTodos(remove(todos, id))
  }

  //新增 依照 id 號碼繼續向下新增
  const add = (todos, text) => {
    const ids = todos.map((v) => v.id)
    const newId = todos.length > 0 ? Math.max(...ids) + 1 : 1
    const newTodo = { id: newId, text: text, compeleted: false, editing: false }

    return [newTodo, ...todos]
  }

  const doAdd = (text) => {
    setTodos(add(todos, text))
  }

  // 完成狀態
  const toggleCompeleted = (todos, id) => {
    return todos.map((v) => {
      if (v.id === id) return { ...v, compeleted: !v.compeleted }
      else return { ...v }
    })
  }

  const handdleToggleCompeleted = (id) => {
    setTodos(toggleCompeleted(todos, id))
  }

  //在 input 輸入完之後，按下 enter 要觸發把值傳進todos
  return (
    <>
      <AddForm doAdd={doAdd} />
      <br />
      <div className="d-flex justify-content-center">
        {filterOption.map((v, i) => {
          return (
            <button
              key={i}
              className={` ${
                filterType === v ? styles['btn-active'] : styles['btn-normal']
              } mx-2 btn btn-light border-0`}
              onClick={() => {
                setFilterType(v)
              }}
            >
              {v}
            </button>
          )
        })}
      </div>
      <div className="text-center mt-3">
        <input
          // className="form-check"
          type="checkbox"
          checked={selectedAll}
          onChange={(e) => {
            // setSelectedAll(!selectedAll)
            setSelectedAll(e.target.checked)
            handdleToggleselectedAll(e.target.checked)
          }}
        />
        <p className="ms-2 d-inline text-light">全部標示為完成</p>
      </div>
      <List
        todos={filterByType(todos, filterType)} //在這邊進行過濾
        handdleToggleCompeleted={handdleToggleCompeleted}
        handdleRemove={handdleRemove}
        handdleToggleEditing={handdleToggleEditing}
        handdleUpdateText={handdleUpdateText}
      />
      <hr />
    </>
  )
}
