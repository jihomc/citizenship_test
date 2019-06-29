const request = require('request-promise');
const cheerio = require('cheerio');

// async request to scrape website for html
// parse html with Cheerio
// return promise of question and answer list as a nested array for mysql

const go = async () => {
    
    let questionlist = [];
    let answerlist = [];
    let listitems = [];
    
    const options = {
        // uri: "https://www.uscis.gov/citizenship/educators/educational-products/100-civics-questions-and-answers-mp3-audio-english-version",
        uri: "http://127.0.0.1:5500/database/build_database.html",
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    
    try {
        const $ = await request(options);
        
        // Loop over each element to build the questionlist and answerlist arrays 

        $('.field-item strong').each((i, el) => {
            let questions = $(el).clone().children('a').remove().end().text();
            if (isNaN(questions[0]) === false) {
                questions = questions.slice(0, -1);
                questionlist.push(questions);
            }
        });

        $('.field-item ul').each((i, el) => {
            $(el).find('div').each((k, elem) => {
                listitems.push($(elem).text().replace(/\s\s+/g, ''));
            })
            answerlist.push(listitems);
            listitems = [];       
        });

        // map questionlist and answerlist into a nested array for mysql

        var qa_list = questionlist.map(function(v, i) {
            return [v, JSON.stringify(answerlist[i])];
        });
        // console.log(qa_list);
        return qa_list;
    }
    catch (err) {
        console.log(err);
    }
};

// Call async function, then return qa_list
// Create mysql database and update questions table with qa_list

go().then(qa_list => {
    
    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: "localhost",
        user: "foo",
        password: "bar",
        // database: "citizen"
    });

    // Establish connection to mysql
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return
        }
        console.log('connected as id ' + connection.threadId);
    })

    // CREATE DATABASE citizen
    connection.query('CREATE DATABASE citizen', function(err, results) {
        if (err) throw err;
        console.log("Created database: citizen " + results);
    })
    
    // USE citizen database
    connection.changeUser({database: 'citizen'}, function(err) {
        if (err) throw err;
        console.log('Using database citizen');
    })
    
    // CREATE TABLE users
    var create_users = "CREATE TABLE users (user_id INT AUTO_INCREMENT PRIMARY KEY, \
                            first_name VARCHAR(50), last_name VARCHAR(50), email VARCHAR(50), \
                            location VARCHAR(50), zip INT)";

    connection.query(create_users, function(err, result) {
        if (err) throw err;
        console.log('Created table: users ' + result);
    })

    // CREATE TABLE questions
    var create_questions = "CREATE TABLE questions (question_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, \
                                question VARCHAR(255) NOT NULL, answer VARCHAR(500) NOT NULL, gen_update INT, \
                                geo_update INT, category VARCHAR(50), subcategory VARCHAR(50))";
    
    connection.query(create_questions, function(err, result) {
        if (err) throw err;
        console.log('Created table: questions ' + result);
    })

    // CREATE TABLE geo
    var create_geo = "CREATE TABLE geo (location VARCHAR(50), question_id INT, \
                            answer VARCHAR(255), needs_zip INT, PRIMARY KEY(location, question_id), \
                            FOREIGN KEY(question_id) REFERENCES questions(question_id))";
                            
    connection.query(create_geo, function(err, result) {
        if (err) throw err;
        console.log('Created table: geo ' + result);
    })


    // CREATE TABLE reps
    var create_reps = "CREATE TABLE reps (location VARCHAR(50), district INT, \
                            representative VARCHAR(50), question_id INT, \
                            PRIMARY KEY(location, district), \
                            FOREIGN KEY(question_id) REFERENCES questions(question_id))";
                            // FOREIGN KEY(location) REFERENCES geo(location), \

    connection.query(create_reps, function(err, result) {
    if (err) throw err;
    console.log('Created table: reps ' + result);
    })

    // CREATE TABLE zips
    var create_zips = "CREATE TABLE zips (location VARCHAR(50), zip_code INT, \
                            districts VARCHAR(100), \
                            PRIMARY KEY(location, zip_code))";
                            // FOREIGN KEY(location, question_id) REFERENCES geo(location, question_id), \
                            // FOREIGN KEY(question_id) REFERENCES geo(question_id))";

    connection.query(create_zips, function(err, result) {
        if (err) throw err;
        console.log('Created table: zips ' + result);
    })


    // INSERT qa_list INTO questions table
    var insert_qa_list = "INSERT INTO questions (question, answer) VALUES ?";
    
    connection.query(insert_qa_list, [qa_list], function(err) {
        if (err) throw err;
        console.log('qa_list inserted questions table.');
    })

    // Test query on questions table
    connection.query('SELECT question, answer FROM questions', function(err, rows, fields) {
        if (err) throw err;
        var answers = rows[1].answer;
        var questions = rows[1].question;
        console.log(answers);
        console.log(questions);
    })

    // console.log(qa_list);

    connection.end();

    })
    .catch(err => console.error(err));















// request('http://127.0.0.1:5500/scrape.html', (error,
// response, html) => {
//     if (!error && response.statusCode == 200) {
//         // console.log(html);
//         const $ = cheerio.load(html);
//         // const selection = $('.field-item');
    
//         // console.log(selection.html());
     
        
//         // // console.log(selection.children().eq(1).text());
//         // // selection.children().eq(1).remove();


//         // console.log(selection.children().eq(1).text());



//         $('strong').each((i, el) => {
//             let questions = $(el).clone().children('a').remove().end().text();
//             if (isNaN(questions[0]) === false) {
//                 questions = questions.slice(0, -1);
//                 questionlist.push(questions);
//             }
//         });

//         // console.log(questionlist);

//         $('ul').each((i, el) => {
//             $(el).find('div').each((k, elem) => {
//                 listitems.push($(elem).text().replace(/\s\s+/g, ''));
//             })
//             answerlist.push(listitems);
//             listitems = [];       
//         });
//         // console.log(answerlist);
            
//     }
// });

