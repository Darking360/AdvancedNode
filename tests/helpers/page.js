const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function(target, property) {
        return target[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('localhost:3000');
    await this.page.waitFor('ul.right > li > a[href="/auth/logout"]');
    await this.page.goto('localhost:3000/blogs')
  }

  async getContentsOf(selector) {
    return await this.page.$eval(selector, el => el.innerHTML)
  }

  async get(path) {
    return this.page.evaluate((_path) => {
      return fetch(_path, {
        mthod: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());
    }, path);
  }

  async post(path, body) {
    return this.page.evaluate((_path, _body) => {
      return fetch(_path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(_body),
      }).then((res) => res.json());
    }, path, body);
  }

}

module.exports = CustomPage;