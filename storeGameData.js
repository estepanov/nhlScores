const fs = require('fs')

const Nightmare = require('nightmare')
const nightmare = Nightmare({ 'show': true, 'ignore-certificate-errors': true })

const cheerio = require('cheerio');

const NHL_SCORES_URL = 'https://www.nhl.com/scores';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';


let score;

nightmare
    .goto(NHL_SCORES_URL)
    .useragent('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')
    .wait('.card--full-bleed')
    .evaluate(() => document.querySelector('.card--full-bleed').innerHTML)
    .end()
    .then((games) => {
        console.log('game data found')
        const $ = cheerio.load(games)
        // $()
        // console.log(games)
        fs.writeFile('gameData.html', $.html(), (err) => {
            if (err) throw err;
            console.log('game data file has been saved!');
          });
    })
    .catch((error) => {
      console.error('Search failed:', error);
    });


    