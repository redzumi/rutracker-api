'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _limitme = require('limitme');

var _limitme2 = _interopRequireDefault(_limitme);

var _parsingutils = require('./parsingutils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var promisify = _bluebird2.default.promisify;

var jar = _request2.default.jar();
var req = _request2.default.defaults({ jar: jar });
var post = promisify(req.post);

var limiter = new _limitme2.default(1000);

var URLS = {
  index: 'http://rutracker.org/forum/index.php',
  login: 'http://rutracker.org/forum/login.php',
  search: 'http://rutracker.org/forum/tracker.php',
  download: 'http://rutracker.org/forum/dl.php',
  topic: 'http://rutracker.org/forum/viewtopic.php'
};

var RutrackerAPI = function RutrackerAPI() {
  var _this = this;

  (0, _classCallCheck3.default)(this, RutrackerAPI);

  this.login = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(username, password, options) {
      var postData, response;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this.checkMaintenance();

            case 2:
              if (!_context.sent) {
                _context.next = 4;
                break;
              }

              throw new Error('Scheduled maintenance.');

            case 4:
              postData = {
                url: URLS.login,
                formData: {
                  login_username: username,
                  login_password: password,
                  login: 'вход'
                }
              };


              if (options) (0, _assign2.default)(postData.formData, options);

              _context.next = 8;
              return post(postData);

            case 8:
              response = _context.sent;

              if (!response.body.includes('BB.toggle_top_login()')) {
                _context.next = 11;
                break;
              }

              throw (0, _parsingutils.parseCaptcha)((0, _parsingutils.toWin1251)(response.body));

            case 11:

              _this._loggedOn = true;

              return _context.abrupt('return', _this._loggedOn);

            case 13:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();

  this.search = function (query) {
    if (!_this._loggedOn) throw new Error('Use "login" at first.');
    return new SearchCursor(query);
  };

  this.topic = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(id) {
      var response;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return post({
                url: URLS.topic,
                qs: { t: id },
                encoding: 'binary' });

            case 2:
              response = _context2.sent;
              return _context2.abrupt('return', (0, _parsingutils.parseTopic)((0, _parsingutils.toWin1251)(response.body)));

            case 4:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x4) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.download = function (id, path) {
    return limiter.enqueue().then(function () {
      return new _bluebird2.default(function (resolve) {
        var ws = _fs2.default.createWriteStream(path);
        ws.on('close', resolve);
        req({ url: URLS.download, qs: { t: id } }).pipe(ws);
      });
    });
  };

  this.checkMaintenance = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
    var response, body;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return post({
              url: URLS.index,
              encoding: 'binary' });

          case 2:
            response = _context3.sent;
            body = (0, _parsingutils.toWin1251)(response.body);
            return _context3.abrupt('return', body.includes('Форум временно отключен'));

          case 5:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, _this);
  }));

  this._loggedOn = false;
}

//every day in 4:40
;

var SearchCursor = function SearchCursor(query) {
  var _this2 = this;

  (0, _classCallCheck3.default)(this, SearchCursor);

  this.forum = function (forum) {
    _this2._forum = forum;
    return _this2;
  };

  this.page = function (page) {
    _this2._page = page;
    return _this2;
  };

  this.exec = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
    var data, response;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            data = { nm: _this2._query };


            if (_this2._forum) data.f = _this2._forum;
            if (_this2._page) data.start = _this2._page * 50; // 1 page = 50 topics

            _context4.next = 5;
            return post({
              url: URLS.search,
              qs: data,
              encoding: 'binary' });

          case 5:
            response = _context4.sent;
            return _context4.abrupt('return', (0, _parsingutils.parseSearch)((0, _parsingutils.toWin1251)(response.body)));

          case 7:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, _this2);
  }));

  if (!query) throw new Error('Query string is required.');

  this._query = query;
  this._forum = null;
  this._page = null;

  return this;
};

exports.default = RutrackerAPI;