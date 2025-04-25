import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'
import blogService from '../services/blogs'

// mock del servicio que se usa internamente en el componente
vi.mock('../services/blogs', () => ({
  default: {
    create: vi.fn()
  }
}))

test('BlogForm calls addBlog with correct data when submitted', async () => {
  const mockAddBlog = vi.fn()
  const mockSetAlert = vi.fn()

  // simula lo que devuelve blogService.create
  blogService.create.mockResolvedValue({
    title: 'testing a form...',
    author: 'testing a form...',
    url: 'testing a form...',
    id: 123
  })

  render(
    <BlogForm addBlog={mockAddBlog} setAlertMessage={mockSetAlert} />
  )

  const user = userEvent.setup()
  const titleInput = screen.getByPlaceholderText('insert title')
  const authorInput = screen.getByPlaceholderText('insert author')
  const urlInput = screen.getByPlaceholderText('insert url')
  const createButton = screen.getByText('Create')

  await user.type(titleInput, 'testing a form...')
  await user.type(authorInput, 'testing a form...')
  await user.type(urlInput, 'testing a form...')
  await user.click(createButton)

  // verifica que addBlog se llamo con el blog creado
  expect(mockAddBlog).toHaveBeenCalledTimes(1)
  expect(mockAddBlog.mock.calls).toHaveLength(1)

  expect(mockAddBlog.mock.calls[0][0].title).toBe('testing a form...')
  expect(mockAddBlog.mock.calls[0][0].author).toBe('testing a form...')
  expect(mockAddBlog.mock.calls[0][0].url).toBe('testing a form...')

  expect(mockAddBlog).toHaveBeenCalledWith({
    title: 'testing a form...',
    author: 'testing a form...',
    url: 'testing a form...',
    id: 123
  })
})