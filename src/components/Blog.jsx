import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ updateBlog, removeBlog, blog, user }) => {
  const [detailsVisible, setDetailsVisible] = useState(false)

  const hideWhenVisible = { display: detailsVisible ? 'none' : '' }
  const showWhenVisible = { display: detailsVisible ? '' : 'none' }

  const handleLike = async (event) => {
    event.preventDefault()

    
    const updatedBlog = { ...blog, likes: blog.likes + 1 }
    // actualizacion rapida
    //updateBlog(updatedBlog)

    try {
      const returnedBlog = await blogService.update(blog.id, updatedBlog)
      updateBlog(returnedBlog)
    } catch (error) {
      console.error('Error updating likes:', error)
      // revertir si hubo error
      updateBlog(blog)
      // podria poner un setAlertMessage
    }
  }

  const handleRemove = async (event) => {
    event.preventDefault()

    if (window.confirm(`Remove blog: ${blog.title}?`)) {
      try {
        await blogService.remove(blog.id)
        removeBlog(blog.id)
      } catch (error) {
        console.error('Error removing blog:', blog.title)
        // podria poner un setAlertMessage
      }
    }
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div style={blogStyle} className='blog'>
      <div className='blog-summary'>
        {blog.title} - {blog.author}
      </div>
      <div style={hideWhenVisible}>
        <button onClick={() => setDetailsVisible(true)} className='view-button'>View</button>
      </div>
      {detailsVisible && (
        <div className='blog-details'>
          <button onClick={() => setDetailsVisible(false)}>Hide</button>
          <p className='blog-url'>URL: {blog.url}</p>
          <p className='blog-likes'>
            Likes: {blog.likes} 
          </p>
          <button onClick={handleLike}>Like</button>
          <p>User: {blog.user.name}</p>
          {blog.user.id === user.id && (
            <button onClick={handleRemove}>Remove</button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog