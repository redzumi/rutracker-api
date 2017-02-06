'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseCaptcha = exports.parseTopic = exports.parseSearch = undefined;

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseSearch = function parseSearch(html) {
  var $ = _cheerio2.default.load(html, { decodeEntities: false });

  var formatSize = function formatSize(size_in_bytes) {
    var size_in_megabytes = size_in_bytes / (1024 * 1024);
    return size_in_megabytes.toString().slice(0, 7);
  };

  var tracks = $('#tor-tbl tbody').find('tr');
  var results = [];

  for (var i = 0; i < tracks.length; i++) {
    var track = $(tracks.get(i));

    results.push({
      state: track.find('.t-ico').next().attr('title'),
      id: track.find('.t-title').find('div a').attr('data-topic_id'),
      category: track.find('.f-name').find('.f-name a').html(),
      title: track.find('.t-title').find('div a').html(),
      author: track.find('.u-name').find('div a').html(),
      size: formatSize(track.find('.tor-size').find('u').html()),
      seeds: track.find('.seedmed').html(),
      leechs: track.find('.leechmed').find('b').html(),
      url: 'http://rutracker.org/forum/' + track.find('.t-title').find('div a').attr('href')
    });
  }

  return results.filter(function (x) {
    return x.id;
  });
};

var parseTopic = function parseTopic(html) {
  var $ = _cheerio2.default.load(html, { decodeEntities: false });

  var topic = $('#topic_main tr');
  var result = {
    created: topic.find('.post-time').find('span a').html(),
    since: topic.find('.post-time').find('span').next().html(),
    image: topic.find('.post_body').find('.postImg').attr('title'),
    magnet: topic.find('.post_body').find('.magnet-link').attr('href'),
    raw_body: ''
  };

  // TODO: FIX ME
  var isBody = true;
  topic.find('.post_body').children().each(function (index, elm) {
    if (elm.attribs.id == 'tor-reged') isBody = false;
    if (isBody) result.raw_body += $(elm).html();
  });

  return result;
};

var parseCaptcha = function parseCaptcha(html) {
  var $ = _cheerio2.default.load(html, { decodeEntities: false });
  var loginBox = $('#login-form-full tr').next();
  var captchaBox = loginBox.find('.login-ssl-block').prev().find('td').next();

  //$('div p').html() - 4:49
  return {
    message: 'Captcha. Maybe incorrect username or password.',
    captcha: 'http://' + captchaBox.find('div img').attr('src'),
    cap_sid: captchaBox.find('div').next().find('input').attr('value'),
    cap_code: captchaBox.find('div').next().find('input').next().attr('name')
  };
};

exports.parseSearch = parseSearch;
exports.parseTopic = parseTopic;
exports.parseCaptcha = parseCaptcha;