import request          from 'request';
import fs               from 'fs';
import Promise          from 'bluebird';
import windows1251      from 'windows-1251';
import RateLimiter      from 'limitme';

import { parseSearch, parseTopic }
                        from './parsingutils';

const promisify   = Promise.promisify;

const jar         = request.jar();
const req         = request.defaults({ jar: jar });
const post        = promisify(req.post);

const limiter     = new RateLimiter(1000);

const URLS = {
  login:      'http://rutracker.org/forum/login.php',
  search:     'http://rutracker.org/forum/tracker.php',
  download:   'http://rutracker.org/forum/dl.php',
  forum:      'http://rutracker.org/forum/'
};

export class RutrackerAPI {
  constructor() {
    this._loggedOn   = false;
  }

  login = async (username, password) => {
    let response = await post({
      url: URLS.login,
      formData: {
        login_username: username,
        login_password: password,
        login: 'Вход'
      }
    });

    this._loggedOn = (response.statusCode == 302);
    return this._loggedOn;
  };

  search = (query) => {
    if(!this._loggedOn) throw new Error('Use "login" at first.');
    return new SearchCursor(query);
  };

  topic = async (url) => {
    let response = await post({ url: url, encoding: 'binary' });
    return parseTopic(windows1251.decode(response.body, {mode: 'html'}));
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
}

class SearchCursor {
  constructor(query) {
    if(!query) throw new Error('Query string is required.');
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

    let response = await post({ url: URLS.search, qs: data, encoding: 'binary' });
    return parseSearch(windows1251.decode(response.body, {mode: 'html'}));
  };

  formatSize = (size_in_bytes) => {
    let size_in_megabytes = size_in_bytes / (1024 * 1024);
    return (size_in_megabytes.toString()).slice(0, 7);
  }
}
