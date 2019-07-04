// Script to scrape testupdates website to update questions 28, 29, 39, 40, 46, 47 in database

const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

const get_testupdates = async () => {

    let questionlist = [];
    let answerlist = [];
    let listitems = [];
    let questionid = [];

    const get_testupdates = {
        uri: 'https://www.uscis.gov/citizenship/testupdates',
        transform: function(body) {
            return cheerio.load(body);
        }
    };

    try {
        // if get_testupdates.html does not exist, create new file
        if (!(fs.existsSync('./get_testupdates.html'))) {
            const $get_testupdates = await request(get_testupdates);

            fs.writeFile("./get_testupdates.html", $get_testupdates.html(), function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log('The file get_testupdates.html was saved!');
            })
        };

        const $ = await cheerio.load(fs.readFileSync('./get_testupdates.html'));

        $('.field-item strong').each((i, el) => {
            // let questions = $(el).clone().children('a').remove().end().text();
            let questions = $(el).text();
        
            // if (isNaN(questions[0]) === false) {
            if (questions.substring(0,2) === "28" || questions.substring(0,2) === "29" || 
                questions.substring(0,2) === "39" || questions.substring(0,2) === "40" || 
                questions.substring(0,2) === "46" || questions.substring(0,2) === "47") {                                  
                questions = questions.slice(0, -1);

                questionlist.push(questions);
                questionid.push(questions.substring(0,2));
            };
        });

        // console.log(questionlist);

        // find each list block in the html
        $('.field-item ul').each((i, el) => {

            // iterate over each list element for answers
            $(el).find('li').each((k, elem) => {

                // answer list text after removing whitespace
                let text = $(elem).text().replace(/\s\s+/g, '');

                // filter out generic "Answers may vary" answers
                // push answers into listitems array
                if (!(text.slice(0, 7) === "Answers")) {
                    listitems.push(text);
                };
            })
            // push non-empty listitem array into answerlist
            if (!(listitems.length === 0)) {
                answerlist.push(listitems);
                listitems = [];       
            };
        });

        // console.log(answerlist);

        let qa_list = questionlist.map(function(v, i) {
            return [v, JSON.stringify(answerlist[i])];
        });

        let qa_list2 = qa_list.map(function(v, i) {
            return [questionid[i], v[0], v[1]];
        })

        return qa_list2
        // console.log(qa_list2);

    }

    catch (err) {
        console.log(err);
    }
};

get_testupdates().then(qa_list2 => {

    var mysql = require('mysql');
    
    var connection = mysql.createConnection({
        host: "localhost",
        user: "foo",
        password: "bar",
        database: "citizen"
    });

    // Establish connection to mysql
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return
        }
        console.log('connected as id ' + connection.threadId);
    })

    // Update questions table with qa_list from testupdates
    var test_updates = "INSERT INTO questions (question_id, question, answer) VALUES ? ON DUPLICATE KEY UPDATE answer = VALUES(answer)"

    // let testlist = [[28, "question 28", "answer 28 yoooo"], [29, "question 29", "answer 29"]];
    connection.query(test_updates, [qa_list2], function(err) {
        if (err) throw err;
        console.log('qa_list inserted questions table.');
    })

    // Test query on questions table
    connection.query('SELECT question, answer FROM questions', function(err, rows, fields) {
        if (err) throw err;
        var answers = rows[27].answer;
        var questions = rows[27].question;
        console.log(questions);
        console.log(answers);
    })



    connection.end();
    
})
.catch(err => console.log(err));


// url https://www.uscis.gov/citizenship/testupdates
// // http://127.0.0.1:5500/testupdates.html
// request('http://127.0.0.1:5500/database/get_testupdates.html', (error,
// response, html) => {
//     if (!error && response.statusCode == 200) {

//         let questionlist = [];
//         let answerlist = [];
//         let listitems = [];
//         let questionid = [];

//         const $ = cheerio.load(html);
        
//         $('.field-item strong').each((i, el) => {
//             // let questions = $(el).clone().children('a').remove().end().text();
//             let questions = $(el).text();
        
//             // if (isNaN(questions[0]) === false) {
//             if (questions.substring(0,2) === "28" || questions.substring(0,2) === "29" || 
//                 questions.substring(0,2) === "39" || questions.substring(0,2) === "40" || 
//                 questions.substring(0,2) === "46" || questions.substring(0,2) === "47") {                                  
//                 questions = questions.slice(0, -1);

//                 questionlist.push(questions);
//                 questionid.push(questions.substring(0,2));
//             };
//         });

//         // console.log(questionlist);

//         // find each list block in the html
//         $('.field-item ul').each((i, el) => {

//             // iterate over each list element for answers
//             $(el).find('li').each((k, elem) => {

//                 // answer list text after removing whitespace
//                 let text = $(elem).text().replace(/\s\s+/g, '');

//                 // filter out generic "Answers may vary" answers
//                 // push answers into listitems array
//                 if (!(text.slice(0, 7) === "Answers")) {
//                     listitems.push(text);
//                 };
//             })
//             // push non-empty listitem array into answerlist
//             if (!(listitems.length === 0)) {
//                 answerlist.push(listitems);
//                 listitems = [];       
//             };
//         });

//         // console.log(answerlist);

//         let qa_list = questionlist.map(function(v, i) {
//             return [v, JSON.stringify(answerlist[i])];
//         });

//         let qa_list2 = qa_list.map(function(v, i) {
//             return [questionid[i], v[0], v[1]];
//         })

//         console.log(qa_list2);
    
//         var mysql = require('mysql');
    
//         var connection = mysql.createConnection({
//             host: "localhost",
//             user: "foo",
//             password: "bar",
//             database: "citizen"
//         });
    
//         // Establish connection to mysql
//         connection.connect(function(err) {
//             if (err) {
//                 console.error('error connecting: ' + err.stack);
//                 return
//             }
//             console.log('connected as id ' + connection.threadId);
//         })
    
//         // Update questions table with qa_list from testupdates
//         var test_updates = "INSERT INTO questions (question_id, question, answer) VALUES ? ON DUPLICATE KEY UPDATE answer = VALUES(answer)"

//         // let testlist = [[28, "question 28", "answer 28 yoooo"], [29, "question 29", "answer 29"]];
//         connection.query(test_updates, [qa_list2], function(err) {
//             if (err) throw err;
//             console.log('qa_list inserted questions table.');
//         })

//         // Test query on questions table
//         connection.query('SELECT question, answer FROM questions', function(err, rows, fields) {
//         if (err) throw err;
//         var answers = rows[27].answer;
//         var questions = rows[27].question;
//         console.log(questions);
//         console.log(answers);
//     })



//         connection.end();
        
//     };

// });