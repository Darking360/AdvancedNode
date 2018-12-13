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

test('When signed in, show logout button', async () => {
  const id = '5c116703ccff14930b67c083';
  const Buffer = require('safe-buffer').Buffer;
  const sessionObject = {
    passport: {
      user: id,
    },
  };

  const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
  const KeyGrip = require('keygrip');
  const keys = require('../config/keys');
  const keygrip = new KeyGrip([keys.cookieKey]);
  const sig = keygrip.sign('session=' + sessionString);

  await page.setCookie({ name: 'session', value: sessionString });
  await page.setCookie({ name: 'session.sig', value: sig });
  await page.goto('localhost:3000');

    await page.waitFor('ul.right > li > a[href="/auth/logout"]');
  const text = await page.$eval('ul.right > li > a[href="/auth/logout"]', el => el.innerHTML);
  expect(text).toEqual('Logout');
  
});

