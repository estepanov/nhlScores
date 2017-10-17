const fs = require('fs')

const Nightmare = require('nightmare')
const nightmare = Nightmare({ 'show': true, 'ignore-certificate-errors': true })

const cheerio = require('cheerio')

module.exports = function () {
    // consts for nightmare to pull proper resources
    const NHL_SCORES_URL = 'https://www.nhl.com/scores';
    const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';

    return nightmare
    .goto(NHL_SCORES_URL)
    .useragent(USER_AGENT)
    .wait('.card--full-bleed')
    .evaluate(() => document.querySelector('.card--full-bleed').innerHTML)
    .end()
    .then((gamesFound) => {
        console.log('game data found')
        const $ = cheerio.load(gamesFound)

        //game list elements
        const gameListItemClass = 'ul.nhl-scores__list.nhl-scores__list--games'
        const games = $(gameListItemClass).children().toArray()
        
        //init a games array to return 
        const gamesArr = [];
        
        var gameDateText = ''
        var gameDate = ''
        console.log("now iterating through games")
        games.forEach((game) => {
            // init new game obj
            const newGameObj = {}
        
            const gameObj = cheerio.load(game)
            console.log(`\n-------------------------------------------------\n`)
        
            const isLabel = gameObj('li').hasClass('nhl-scores__list-item--label')
            if (isLabel) {
                // is a Label
                gameDate = gameObj('li').attr('id');
                gameDate = gameDate.slice(gameDate.indexOf("__")+2);
                gameDateText = gameObj('span').text();
                console.log(gameDateText)
            } else {
                // is a game
                newGameObj.gameDateText = gameDateText
                newGameObj.gameDate = gameDate
                const gameStatus = gameObj('span.g5-component--nhl-scores__status-state-label').html()
                if(gameStatus == 'Final') {
                    newGameObj.gameStatus = 'Final'
                }
                // console.log('!!!!!',gameStatus)
                const currentPeriod = gameObj('.g5-component--nhl-scores__status-current-period').text()
                const currentPeriodTime = gameObj('.g5-component--nhl-scores__status-current-period-time').text()
                if (currentPeriod !== '') {
                    newGameObj.currentPeriod = currentPeriod
                    newGameObj.currentPeriodTime = currentPeriodTime
                    newGameObj.gameStatus = 'Ongoing'
                }
                
                let teamsArr = [];
                const teamsText = gameObj('.g5-component--nhl-scores__screen-reader h5')
                    .toArray().forEach((team) => {
                        teamsArr.push(team.children[0].data)
                })
        
                if(newGameObj.gameStatus == 'Ongoing' || newGameObj.gameStatus == 'Final') {
                    newGameObj.awayTeam = teamsArr[0].slice(0,-8)
                    newGameObj.homeTeam = teamsArr[1].slice(0,-8)
                } else {
                    newGameObj.awayTeam = teamsArr[0]
                    newGameObj.homeTeam = teamsArr[1]
                }
        
                let scoreArr = [];
                gameObj('td.g5-component--nhl-scores__linescore-total-goals')
                    .toArray().forEach((score)=>{
                        scoreArr.push(score.children[0].data)
                    })
                if(scoreArr[0]) {
                    newGameObj.awayTeamScore = scoreArr[0].toString().trim()
                    newGameObj.homeTeamScore = scoreArr[1].toString().trim()
                } else {
                    newGameObj.gameStatus = 'Pending';
                    // because the game is pending lets grab the time of the game
                    const gameTime = gameObj('.g5-component--nhl-scores__status-game-time').text()
                    newGameObj.gameTime = gameTime
                }
        
                // const tessst = gameObj()
                // console.log("TEST for VALUE::::",tessst)
        
                console.log(newGameObj)
                gamesArr.push(newGameObj)
            }
        })

        return gamesArr;


    })
    .catch((error) => {
    console.error('Search failed:', error);
    });
}

// module.exports = getScores