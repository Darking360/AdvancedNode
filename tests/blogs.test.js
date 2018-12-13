const puppeteer = require('puppeteer');
const CustomPage = require('./helpers/page');

let page;

beforeEach( async () => {
  page = await CustomPage.build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in into create blog page', () => {
  beforeEach(async () => {
    await page.login();
    await page.waitFor('div.fixed-action-btn > a');
    await page.click('div.fixed-action-btn > a');
  });

  test('Can see create blog page', async () => {
    await page.waitFor('form');
    const titleLabel = await page.getContentsOf('form > div.title > label');
    const contentLabel = await page.getContentsOf('form > div.content > label');
    const buttonTextSubmit = await page.getContentsOf('form > button[type="submit"]');
    expect(titleLabel).toEqual('Blog Title');
    expect(contentLabel).toEqual('Content');
    expect(buttonTextSubmit).toContain('Next');
  });

  describe('And using invalid input', () => {
    beforeEach(async () => {
      await page.click('form > button[type="submit"]');
      await page.waitFor('div.red-text');
    });

    test('Validations work', async () => {
      const titleErrorLabel = await page.getContentsOf('form > div.title > div.red-text');
      const contentErrorLabel = await page.getContentsOf('form > div.content > div.red-text');
      expect(titleErrorLabel).toEqual('You must provide a value'); 
      expect(contentErrorLabel).toEqual('You must provide a value');
    });
  });

});