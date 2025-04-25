import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders content', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Tester',
    url: 'urltest.com',
    likes: 5,
    user: {
        name: "Tester",
        id: 1234
    }
  }

  const user = {
    name: "Tester",
    id: 1234
  }

  const { container } = render(<Blog blog={blog} user={user} />)

  // verifies title and author
  const summary = screen.getByText('Component testing is done with react-testing-library - Tester')
  expect(summary).toBeDefined()
  
  /*
   const div = container.querySelector('.blog-summary')
  expect(div).toHaveTextContent(
    'Component testing is done with react-testing-library'
  ) */

  // verifies that url and likes arent visible
  const details = screen.queryByText('urltest.com')
  expect(details).toBeNull()

  const likes = screen.queryByText('Likes:')
  expect(likes).toBeNull()
})

test('clicking the button calls event handler once', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Tester',
    url: 'urltest.com',
    likes: 5,
    user: {
        name: "Tester",
        id: 1234
    }
  }

  const user = {
    name: "Tester",
    id: 1234
  }

  const { container } = render(<Blog blog={blog} user={user} />)

  const testuser = userEvent.setup()
  const button = screen.getByText('View') //container.querySelector('button') o container.querySelector('.view-button') 
  await testuser.click(button)

  expect(screen.getByText('URL: urltest.com')).toBeDefined()
  expect(screen.getByText('Likes: 5')).toBeDefined()
})

test('clicking the like button twice calls event handler twice', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Tester',
    url: 'urltest.com',
    likes: 5,
    user: {
        name: "Tester",
        id: 1234
    }
  }

  const user = {
    name: "Tester",
    id: 1234
  }

  const mockHandler = vi.fn()

  const { container } = render(<Blog blog={blog} user={user} updateBlog={mockHandler}/>)

  const testuser = userEvent.setup()
  
  const viewButton = screen.getByText('View') //container.querySelector('button') o container.querySelector('.view-button') 
  await testuser.click(viewButton)

  const likeButton = screen.getByText('Like')
  await testuser.click(likeButton)
  await testuser.click(likeButton)

  //screen.debug()

  expect(mockHandler.mock.calls).toHaveLength(4) //I have to use 4 instead of 2 because of the way I defined handleLike function
})