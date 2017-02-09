import cheerio          from 'cheerio';
import windows1251      from 'windows-1251';

let parseSearch = (html) => {
  let $ = cheerio.load(html, { decodeEntities: false });

  let formatSize = (size_in_bytes) => {
    let size_in_megabytes = size_in_bytes / (1024 * 1024);
    return (size_in_megabytes.toString()).slice(0, 7);
  };

  let tracks  = $('#tor-tbl tbody').find('tr');
  let results = [];

  for(let i = 0; i < tracks.length; i++) {
    let track = $(tracks.get(i));

    results.push({
      state    : track.find('.t-ico').next().attr('title'),
      id       : track.find('.t-title').find('div a').attr('data-topic_id'),
      category : track.find('.f-name').find('.f-name a').html(),
      title    : track.find('.t-title').find('div a').html(),
      author   : track.find('.u-name').find('div a').html(),
      size     : formatSize(track.find('.tor-size').find('u').html()),
      seeds    : track.find('.seedmed').html(),
      leechs   : track.find('.leechmed').find('b').html(),
      url      : 'http://rutracker.org/forum/' + track.find('.t-title').find('div a').attr('href')
    });
  }

  return results.filter((x) => { return x.id; });
};

let parseTopic = (html) => {
  let $ = cheerio.load(html, { decodeEntities: false });

  let topic   = $('#topic_main tr');
  let result = {
    created   : topic.find('.post-time').find('span a').html(),
    since     : topic.find('.post-time').find('span').next().html(),
    image     : topic.find('.post_body').find('.postImg').attr('title'),
    magnet    : topic.find('.post_body').find('.magnet-link').attr('href'),
    raw_body  : ''
  };

  // TODO: FIX ME
  let isBody = true;
  topic.find('.post_body').children().each((index, elm) => {
    if(elm.attribs.id == 'tor-reged') isBody = false;
    if(isBody) result.raw_body += $(elm).html();
  });

  return result;
};

let parseCaptcha = (html) => {
  let $ = cheerio.load(html, { decodeEntities: false });
  let loginBox   = $('#login-form-full tr').next();
  let captchaBox = loginBox.find('.login-ssl-block').prev().find('td').next();

  //$('div p').html() - 4:49
  return {
    message: 'Captcha. Maybe incorrect username or password.',
    captcha   : 'http:' + captchaBox.find('div img').attr('src'),
    cap_sid   : captchaBox.find('div').next().find('input').attr('value'),
    cap_code  : captchaBox.find('div').next().find('input').next().attr('name'),
  };
};

let toWin1251 = (data) => {
  return windows1251.decode(data, { mode: 'html' });
};

export { parseSearch, parseTopic, parseCaptcha, toWin1251 };
