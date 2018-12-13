const puppeteer = require('puppeteer');

let browser, page;

beforeEach( async () => {
  browser = await puppeteer.launch({
    headless: false,
  });
  page = await browser.newPage();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await browser.close();
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