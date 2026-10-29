import React from 'react'
import { Link } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
  return (
    <div className='not-found-container'>
      <div className='not-found-content'>
        <h1 className='not-found-title'>404</h1>
        <p className='not-found-message'>אופס! העמוד שחיפשת לא קיים.</p>
        <Link to={"/"} className='not-found-link'>חזרה לדף הבית</Link>
      </div>
    </div>
  )
}

export default NotFound