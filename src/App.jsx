import { useState, useEffect, useRef } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Blog from './components/Blog'
import Togglable from './components/Togglable'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [alertMessage, setAlertMessage] = useState(null)

  const togglableRef = useRef()

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await blogService.getAll()
        setBlogs(blogs)
      } catch (error) {
        console.error('Failed to fetch blogs:', error)
      }
    }

    fetchBlogs()
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setAlertMessage({ text: 'Wrong username or password', type: 'error' })
      setTimeout(() => setAlertMessage(null), 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    blogService.setToken(null)
  }

  const handleUsernameChange = (event) => {
    setUsername(event.target.value)
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
  }

  const addBlog = (newBlog) => {
    newBlog.user = user
    setBlogs(blogs.concat(newBlog))
    togglableRef.current.toggleVisibility()
  }

  const updateBlog = (updatedBlog) => {
    setBlogs(blogs.map(blog => blog.id !== updatedBlog.id ? blog : updatedBlog))
  }

  const removeBlog = (id) => {
    setBlogs(blogs.filter(blog => blog.id !== id))
  }

  const getSortedBlogs = (unsortedBlogs) => {
    return [...unsortedBlogs]
      .sort((a, b) => b.likes - a.likes)
      .map((blog) => (
        <Blog key={blog.id} updateBlog={updateBlog} removeBlog={removeBlog} blog={blog} user={user}/>
      ))
  }

  const renderBlogs = () => (
    <>
      <h1>Blogs</h1>
      <p>{user.name} logged in</p>
      <button onClick={handleLogout}>logout</button>
      <Togglable buttonLabel="New Blog" ref={togglableRef}>
        <BlogForm
          addBlog={addBlog}
          setAlertMessage={setAlertMessage}
        />
      </Togglable>
      <h2>Bloglist</h2>
      {getSortedBlogs(blogs)}
    </>
  )

  return (
    <div>
      <Notification message={alertMessage} />
      {user === null ? (
        <LoginForm
          username={username}
          password={password}
          handleLogin={handleLogin}
          handleUsernameChange={handleUsernameChange}
          handlePasswordChange={handlePasswordChange}
        />
      ) : (
        renderBlogs()
      )}
    </div>
  )
}

export default App
