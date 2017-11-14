import { TestPage } from './app.po'

describe('ngtest App', () => {
  let page: TestPage
  beforeEach(() => {
    page = new TestPage()
  })
  it('should display message saying app works', async () => {
    await page.navigateTo()
    const text = await page.getParagraphText()
    expect(text).toEqual('app works!')
  })
})
