import request          from 'request';
import fs               from 'fs';
import Promise          from 'bluebird';
import RateLimiter      from 'limitme';

import { parseSearch, parseTopic, parseCaptcha, toWin1251 }
                        from './parsingutils';

const promisify   = Promise.promisify;

const jar         = request.jar();
const req         = request.defaults({ jar: jar });
const post        = promisify(req.post);

const limiter     = new RateLimiter(1000);

const URLS = {
  index:      'http://rutracker.org/forum/index.php',
  login:      'http://rutracker.org/forum/login.php',
  search:     'http://rutracker.org/forum/tracker.php',
  download:   'http://rutracker.org/forum/dl.php',
  topic:      'http://rutracker.org/forum/viewtopic.php'
};

class RutrackerAPI {
  constructor() {
    this._loggedOn   = false;
  }

  login = async (username, password, options) => {

    if(await this.checkMaintenance())
      throw new Error('Scheduled maintenance.');

    let postData = {
      url: URLS.login,
      formData: {
        login_username: username,
        login_password: password,
        login: 'вход'
      }
    };

    if(options)
      Object.assign(postData.formData, options);

    let response = await post(postData);

    //login panel (captcha)
    if(response.body.includes('BB.toggle_top_login()'))
      throw parseCaptcha(toWin1251(response.body));

    this._loggedOn = true;

    return this._loggedOn;
  };

  search = (query) => {
    if(!this._loggedOn)
      throw new Error('Use "login" at first.');
    return new SearchCursor(query);
  };

  topic = async (id) => {
    let response = await post({
      url: URLS.topic,
      qs: { t: id },
      encoding: 'binary' });
    return parseTopic(toWin1251(response.body));
  };

  download = (id, path) => {
    return limiter.enqueue()
      .then(() => {
        return new Promise((resolve) => {
          let ws = fs.createWriteStream(path);
          ws.on('close', resolve);
          req({ url: URLS.download, qs: { t: id } }).pipe(ws);
        })
      });
  };

  //every day in 4:40
  checkMaintenance = async () => {
    let response = await post({
      url: URLS.index,
      encoding: 'binary' });
    let body = toWin1251(response.body);
    return body.includes('Форум временно отключен');
  };
}

class SearchCursor {
  constructor(query) {
    if(!query)
      throw new Error('Query string is required.');

    this._query      = query;
    this._forum      = null;
    this._page       = null;

    return this;
  }

  forum = (forum) => {
    this._forum = forum;
    return this;
  };

  page = (page) => {
    this._page = page;
    return this;
  };

  exec = async () => {
    let data = { nm: this._query };

    if(this._forum) data.f      = this._forum;
    if(this._page)  data.start  = this._page * 50; // 1 page = 50 topics

    let response = await post({
      url: URLS.search,
      qs: data,
      encoding: 'binary' });
    return parseSearch(toWin1251(response.body));
  };
}

export default RutrackerAPI;
