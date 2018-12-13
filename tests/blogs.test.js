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

  describe('And using invalid inputs', () => {
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
  
  describe('And using valid inputs', () => {
    beforeEach(async () => {
      await page.type('form > div.title > input', 'Test aiuda 1');
      await page.type('form > div.content > input', 'Lorem ipsun text');
      await page.click('form > button[type="submit"]');
    });

    test('Submitting takes use to review screen', async () => {
      const text = await page.getContentsOf('form > h5');
      expect('Please confirm your entries');
    });

    test('Submitting takes use to review screen, and creates blog post', async () => {
      await page.click('button.green');
      await page.waitFor('div.card > div > div > span');
      const title = await page.getContentsOf('div.card > div > div.card-content > span');
      expect(title).toEqual('Test aiuda 1');
      const content = await page.getContentsOf('div.card > div > div.card-content > p');
      expect(content).toEqual('Lorem ipsun text');
    });
  });
});

describe('When not logged in', () => {
  test('And tries to submit XHR to create a blog post', async () => {
    const result = await page.evaluate(() => {
      return fetch('api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Titulo',
          content: 'Lorem ipsum text',
        }),
      }).then((res) => res.json());
    });
    expect(result).toEqual({ error: 'You must log in!' });
  });

  test('And tries to get a list of posts', async () => {
    const result = await page.evaluate(() => {
      return fetch('api/blogs', {
        mthod: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());
    });
    expect(result).toEqual({ error: 'You must log in!' });
  });
});