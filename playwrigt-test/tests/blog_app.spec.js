const { describe, test, expect, beforeEach } = require('@playwright/test')

const loginWith = async (page, username = 'testuser', password = 'clave')  => {
    await page.getByTestId('username').fill(username)
    await page.getByTestId('password').fill(password)
    await page.getByRole('button', { name: 'login' }).click()
    
}

const createBlog = async (page, title, author, url)  => {
    await page.getByRole('button', { name: 'New Blog' }).click()
    await page.getByPlaceholder('insert title').fill(title)
    await page.getByPlaceholder('insert author').fill(author)
    await page.getByPlaceholder('insert url').fill(url)
    await page.getByRole('button', { name: 'Create' }).click()
}

describe('Blog app', () => {

    beforeEach(async ({ page, request }) => {
        
        await request.post('/api/testing/reset') // vacia la base de datos
        await request.post('/api/users', { // crea un usuario para el backend
          data: {
            name: 'Test User',
            username: 'testuser',
            passwordHash: 'clave'
          }
        })

        await page.goto('/')
    })

    test('Login form is shown', async ({ page }) => {
        const locator = await page.getByText('Login to application')
        await expect(locator).toBeVisible()
        await expect(page.getByText('username')).toBeVisible()
        await expect(page.getByText('password')).toBeVisible()
      })

    describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {
            loginWith(page)
            await expect(page.getByText('Test User logged in')).toBeVisible()
        })

        test('fails with wrong credentials', async ({ page }) => {
            loginWith(page, 'testuser', 'wrong')

            const errorDiv = await page.locator('.error')
            await expect(errorDiv).toContainText('Wrong username or password')
            await expect(page.getByText('Wrong username or password')).toBeVisible()
            await expect(errorDiv).toHaveCSS('border-style', 'solid')
            await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
            await expect(page.getByText('Test User logged in')).not.toBeVisible()
        })
    })

    describe('When logged in', () => {

        beforeEach(async ({ page }) => {
            loginWith(page)
        })
    
        test('a new blog can be created', async ({ page }) => {
            createBlog(page, 'a blog created by playwright', 'playwright', 'playwrightblog.com')
            await expect(page.getByText('a blog created by playwright - playwright')).toBeVisible()
        })

        test('a blog can be updated (give like)', async ({ page }) => {
            createBlog(page, 'a blog created by playwright', 'playwright', 'playwrightblog.com')
            await expect(page.getByText('a blog created by playwright - playwright')).toBeVisible()

            await page.getByRole('button', { name: 'View' }).click()
            await expect(page.getByText('Likes: 0')).toBeVisible()

            await page.getByRole('button', { name: 'Like' }).click()
            await expect(page.getByText('Likes: 1')).toBeVisible()
        })

        test('a blog can be removed', async ({ page }) => {
            createBlog(page, 'a blog created by playwright', 'playwright', 'playwrightblog.com')
            await expect(page.getByText('a blog created by playwright - playwright')).toBeVisible()

            await page.getByRole('button', { name: 'View' }).click()

            page.on('dialog', dialog => dialog.accept())
            await page.getByRole('button', { name: 'Remove' }).click()

            await expect(page.getByText('a blog created by playwright - playwright')).not.toBeVisible()
        })

        test('only the creator of a blog sees the remove button', async ({ page, request }) => {
            // cerrar sesion del usuario iniciado por el beforeEach
            await page.getByRole('button', { name: 'Logout' }).click()
          
            // crear usuario A (creador)
            await request.post('/api/users', {
              data: {
                name: 'User A',
                username: 'usera',
                passwordHash: 'clave'
              }
            })
          
            // crear usuario B (otro)
            await request.post('/api/users', {
              data: {
                name: 'User B',
                username: 'userb',
                passwordHash: 'clave'
              }
            })
          
            // iniciar sesion de usera y crear blog
            await loginWith(page, 'usera', 'clave')
            await createBlog(page, 'Blog privado', 'usera', 'privado.com')
            await expect(page.getByText('Blog privado - usera')).toBeVisible()
          
            // cerrar sesion de usera
            await page.getByRole('button', { name: 'Logout' }).click()
          
            // iniciar sesion de userb
            await page.goto('/')
            await loginWith(page, 'userb', 'clave')
          
            // buscar blog creado por usera
            await expect(page.getByText('Blog privado - usera')).toBeVisible()
            await page.getByRole('button', { name: 'View' }).click()
          
            // asegurarse de que userb no ve el boton Remove
            const removeButton = page.getByRole('button', { name: 'Remove' })
            await expect(removeButton).not.toBeVisible()

        })

        test('blogs are ordered by likes descending', async ({ page }) => {

            async function createAndLikeBlog(page, title, author, url, likes = 0) {
                // crear blog
                await createBlog(page, title, author, url)
              
                // ver detalles
                const blogLocator = page.locator('.blog').filter({ hasText: title })
                await blogLocator.getByRole('button', { name: 'View' }).click()
              
                // dar likes
                for (let i = 0; i < likes; i++) {
                  await blogLocator.getByRole('button', { name: 'Like' }).click()
                  await page.waitForTimeout(500)
                }
              
                // ocultar detalles
                await blogLocator.getByRole('button', { name: 'Hide' }).click()
                await page.waitForTimeout(500)
            }

            // crear y likear blogs
            await createAndLikeBlog(page, 'First Blog', 'Author', 'blog1.com', 2)
            await createAndLikeBlog(page, 'Second Blog', 'Author', 'blog2.com', 3)
            await createAndLikeBlog(page, 'Third Blog', 'Author', 'blog3.com', 5)

            // verificar orden
            const blogs = page.locator('.blog-summary')
            await expect(blogs.nth(0)).toContainText('Third Blog')
            await expect(blogs.nth(1)).toContainText('Second Blog')
            await expect(blogs.nth(2)).toContainText('First Blog')

        })
    }) 
})
