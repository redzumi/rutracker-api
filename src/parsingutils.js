import cheerio          from 'cheerio';

let parseSearch = (html) => {
  let $ = cheerio.load(html, { decodeEntities: false });

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
      size     : this.formatSize(track.find('.tor-size').find('u').html()),
      seeds    : track.find('.seedmed').html(),
      leechs   : track.find('.leechmed').find('b').html(),
      url      : URLS.forum + track.find('.t-title').find('div a').attr('href')
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

  let isBody = true;
  topic.find('.post_body').children().each((index, elm) => {
    if(elm.attribs.id == 'tor-reged') isBody = false;
    if(isBody) result.raw_body += $(elm).html();
  });

  return result;
};

export { parseSearch, parseTopic };
