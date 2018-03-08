import { readFileSync } from 'fs';
import glob from 'packing-glob';
import rimraf from 'rimraf';
import { exec } from '../../util';
import { getTestCaseName } from '../../util';

describe(getTestCaseName(), async () => { // eslint-disable-line
  let publicPath;

  before(async () => {
    process.env.CONTEXT = __dirname;
    process.env.NODE_ENV = 'local';
    // process.env.NODE_ENV = 'production';

    publicPath = process.env.NODE_ENV === 'local' ?
      '/' :
      '//q.qunarzz.com/__xxxx__/prd/assets/';

    rimraf.sync(`${__dirname}/prd`);
    const cmd = 'node_modules/.bin/babel-node src/bin/packing.js build';
    // await exec(cmd);
    const stdout = await exec(cmd);
    console.log(stdout);
  });

  describe('单层目录', async () => {
    let html;
    before(async () => {
      const cwd = `${__dirname}/prd/templates`;
      glob('a.html', { cwd }).forEach((file) => {
        html = readFileSync(`${cwd}/${file}`, { encoding: 'utf-8' });
      });
    });

    it('应该包含网页标题', async () => {
      html.should.match(/<title>Page A<\/title>/);
    });

    it('应该包含网页关键字', async () => {
      html.should.match(/<meta name="keywords" content="A AA">/);
    });

    it('应该包含网页描述', async () => {
      html.should.match(/<meta name="description" content="A simple text">/);
    });

    it('应该引用了 vendor.js', async () => {
      const regexp = new RegExp(`<script src="${publicPath}js/vendor_\\w{8}.js"></script>`);
      html.should.match(regexp);
    });

    it('应该引用了 a.js', async () => {
      const regexp = new RegExp(`<script src="${publicPath}js/a_\\w{8}.js"></script>`);
      html.should.match(regexp);
    });

    it('应该按 vendor.js -> a.js 的顺序引用', async () => {
      const vendorMatches = html.match(new RegExp(`<script src="${publicPath}js/vendor_\\w{8}.js"></script>`));
      const aMatches = html.match(new RegExp(`<script src="${publicPath}js/a_\\w{8}.js"></script>`));
      (vendorMatches.index < aMatches.index).should.be.true();
    });

    it('应该将存在的 __var__ 变量替换为实际变量', async () => {
      html.should.match(/<h1>Beijing<\/h1>/);
    });

    it('应该将不存在的 __var__ 变量替换为空字符串', async () => {
      html.should.match(/<h2><\/h2>/);
    });
  });

  describe('多层目录', async () => {
    let html;
    before(async () => {
      const cwd = `${__dirname}/prd/templates`;
      glob('c/d.html', { cwd }).forEach((file) => {
        html = readFileSync(`${cwd}/${file}`, { encoding: 'utf-8' });
      });
    });

    it('应该包含网页标题', async () => {
      html.should.match(/<title>untitled<\/title>/);
    });

    it('应该不包含网页关键字', async () => {
      html.should.not.match(/<meta name="keywords"/);
    });

    it('应该不包含网页描述', async () => {
      html.should.not.match(/<meta name="description"/);
    });

    it('应该引用了 vendor.js', async () => {
      html.should.match(new RegExp(`<script src="${publicPath}js/vendor_\\w{8}.js"></script>`));
    });

    it('应该引用了 c/d.js', async () => {
      html.should.match(new RegExp(`<script src="${publicPath}js/c/d_\\w{8}.js"></script>`));
    });

    it('应该按 vendor.js -> c/d.js 的顺序引用', async () => {
      const vendorMatches = html.match(new RegExp(`<script src="${publicPath}js/vendor_\\w{8}.js"></script>`));
      const aMatches = html.match(new RegExp(`<script src="${publicPath}js/c/d_\\w{8}.js"></script>`));
      (vendorMatches.index < aMatches.index).should.be.true();
    });
  });

  after(async () => {
    // 删除临时文件
    // rimraf.sync(`${__dirname}/prd`);
  });
});
