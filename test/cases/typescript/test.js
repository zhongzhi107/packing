import { resolve } from 'path';
import request from 'supertest';
import webpack from 'webpack';
import Express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import urlrewrite from 'packing-urlrewrite';
import { getTestCaseName } from '../../util';
import { pRequire, middleware, getContext } from '../../../src';

describe(getTestCaseName(), async () => {
  let app;
  before(() => {
    const context = getContext();
    const appConfig = pRequire('config/packing');
    const webpackConfig = pRequire('config/webpack.serve.babel', {}, appConfig);

    const mwOptions = process.env.DEBUG ? {
      serverSideRender: true
    } : {
      serverSideRender: true,
      // 禁止 webpack-dev-middleware 输出日志
      logger: {
        info: () => {},
        error: console.log
      }
    };

    app = new Express();
    app.use(Express.static(resolve(context, appConfig.path.tmpDll)));
    const compiler = webpack(webpackConfig);
    const webpackDevMiddlewareInstance = webpackDevMiddleware(compiler, mwOptions);
    webpackDevMiddlewareInstance.waitUntilValid(async () => {
      app.use(urlrewrite(appConfig.rewriteRules));
      middleware(app, appConfig);
    });
    app.use(webpackDevMiddlewareInstance);
  });

  describe('/', async () => {
    let res;
    before(async () => {
      res = await request(app.listen()).get('/index');
      console.log(res.text);
    });

    it('应该正常返回网页', async () => {
      res.status.should.eql(200);
    });
  });
});
