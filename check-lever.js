const cheerio = require('cheerio');
fetch('https://jobs.lever.co/palantir')
  .then(res => res.text())
  .then(html => {
    const $ = cheerio.load(html);
    const postings = $('.posting').map((i, el) => {
      return {
        title: $(el).find('h5[data-qa="posting-name"]').text().trim() || $(el).find('h5').text().trim(),
        department: $(el).find('.sort-by-team').text().trim(),
        location: $(el).find('.sort-by-location').text().trim() || $(el).find('.location').text().trim(),
        url: $(el).find('a.posting-btn-submit').attr('href') || $(el).find('a.posting-title').attr('href')
      };
    }).get();
    console.log(JSON.stringify(postings.slice(0, 3), null, 2));
    console.log(`Total postings: ${postings.length}`);
  });
