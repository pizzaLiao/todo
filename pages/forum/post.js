/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react'
import AsideMenu from '@/components/forum/aside-menu'

export default function Post() {
  return (
    <div className="d-flex justify-content-center">
      <div className="container row">
        <div className="col-lg-2 col-4">
          <AsideMenu />
        </div>
        <div className="col-lg-10 col-8 mt-4">
          <div className="container">
            <div className="d-flex">
              <div className="me-5">
                <span className={`postSpan`}>選擇發文主題</span>
                <select name="" id="" className="form-select">
                  <option value="認識狗狗">認識狗狗</option>
                  <option value="訓練狗狗">訓練狗狗</option>
                  <option value="請益求救">請益求救</option>
                  <option value="介紹狗狗">介紹狗狗</option>
                  <option value="好物開箱">好物開箱</option>
                </select>
              </div>
              <div>
                <span className={`postSpan`}>新增文章標籤</span>
              </div>
            </div>
            <div className="mt-3">
              <span className={`postSpan`}>標題</span>
              <div class="form-floating">
                <input
                  type="text"
                  class="form-control"
                  id="floatingPassword"
                  placeholder="寫下你的標題"
                />
                <label for="floatingPassword">寫下你的標題</label>
              </div>
            </div>
            <div className="mt-3">
              <span className={`postSpan`}>內文</span>
              <div class="form-floating">
                <textarea
                  className="form-control"
                  placeholder="開始發文吧"
                  id="floatingTextarea2"
                  style={{ height: 500 }}
                ></textarea>
                <label for="floatingTextarea2">開始發文吧</label>
              </div>
            </div>
            <div className="d-flex justify-content-between mt-5">
              <button className="btn btn-secondary">取消</button>
              <button className="btn btn-primary">下一步</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
