const scores = require('./scores');

scores()
    .then(data => {
        console.log("Game data has been parsed into the data variable....")
    })