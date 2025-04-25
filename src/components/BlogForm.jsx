import { useState } from 'react'
import blogService from '../services/blogs'

const BlogForm = ({ addBlog, setAlertMessage }) => {
  const [newBlog, setNewBlog] = useState({ title: '', author: '', url: '' })

  const handleNewBlogChange = (event) => {
    const { name, value } = event.target
    setNewBlog({ ...newBlog, [name]: value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const returnedBlog = await blogService.create(newBlog)
      addBlog(returnedBlog)
      setAlertMessage({ text: `Added new blog: ${returnedBlog.title}, by ${returnedBlog.author}`, type: 'success' })
      setTimeout(() => setAlertMessage(null), 5000)
      setNewBlog({ title: '', author: '', url: '' })
    } catch (exception) {
      setAlertMessage({ text: 'Error adding new blog', type: 'error' })
      setTimeout(() => setAlertMessage(null), 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="blog-form">
      <h2>Create new blog</h2>
      <div>
        title:
        <input
          type="text"
          value={newBlog.title}
          name="title"
          onChange={handleNewBlogChange}
          placeholder='insert title'
        />
      </div>
      <div>
        author:
        <input
          type="text"
          value={newBlog.author}
          name="author"
          onChange={handleNewBlogChange}
          placeholder='insert author'
        />
      </div>
      <div>
        url:
        <input
          type="text"
          value={newBlog.url}
          name="url"
          onChange={handleNewBlogChange}
          placeholder='insert url'
        />
      </div>
      <button type="submit">Create</button>
    </form>
  )
}

export default BlogForm