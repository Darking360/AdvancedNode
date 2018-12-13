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

test('Header has the correct test', async () => {
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);
  expect(text).toEqual('Blogster');
});

test('Click login starts oauth flow', async () => {
  await page.click('ul.right > li > a[href="/auth/google"]');
  const url = await page.url();
  expect(url).toMatch('/accounts\.google\.com/');
});

test('When signed in, show logout button', async () => {
  await page.login();
  await page.waitFor('ul.right > li > a[href="/auth/logout"]');
  const text = await page.$eval('ul.right > li > a[href="/auth/logout"]', el => el.innerHTML);
  expect(text).toEqual('Logout');
  
});