const fs = require('fs')
const cheerio = require('cheerio')

const gameFile = fs.readFileSync('./gameData.html').toString()

const $ = cheerio.load(gameFile,{
    ignoreWhitespace: true,
})
// todays date from game class
// const dateClass = 'span.nhl-scores__list-date-label-item'
// const todaysGameDate = $(dateClass).html()
//game list elements
const gameListItemClass = 'ul.nhl-scores__list.nhl-scores__list--games'
const games = $(gameListItemClass).children().toArray()

//init a games array
const gamesArr = [];

var gameDateText = ''
var gameDate = ''
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

        let recordsArr = [];
        const recordsText = gameObj('.g5-component--nhl-scores__team-record')
            .toArray().forEach(record => {
                console.log(":::::::::::::::",record)
            })


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
            // because game is still pending lets get the time of the game
            const gameTime = gameObj('.g5-component--nhl-scores__status-game-time').text()
            // console.log(":::::GAME TIME::::::",gameTime)
            newGameObj.gameTime = gameTime
        }

        const tessst = gameObj()
        // console.log("TEST for VALUE::::",tessst)

        console.log(newGameObj)
        gamesArr.push(newGameObj)
    }
})


function saveToFile(fileName, data) {
    fs.writeFileSync(fileName, data)
    console.log(`New file: ${fileName} has been created..... `)
}