// Script to update geo table with all locations and answers for questions 20, 43, and 44
// -- Question_id 20: Senators (D.C. (or the territory where the applicant lives) has no U.S. Senators.)
// -- Question_id 44: Capitals (D.C. is not a state and does not have a capital, territories name capitals)
// -- Question_id 43: Governors (D.C. does not have a Governor) 

const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
// const fs = require('fs').promises;

// JSON object for states, territories and abbreviations
// const locations = require('./locations.js');

let govlist = [];
let senlist = [];
let caplist = [];
let locations = {};

// fs promise?
// await fs.readFile('./governors.html', 'utf8', function(err, data) {
//     if (err) throw err;
//     const $governors = cheerio.load(data);
// });

// async load saved html files to Cheerio for parsing
// create govlist, senlist, caplist to populate geo table

const geo = async() => {
    
    try {
        // load saved html files into Cheerio for parsing
        const $governors = cheerio.load(fs.readFileSync('./governors.html'));
        const $senators = cheerio.load(fs.readFileSync('./senators.html'), {
                xmlMode: true
            });
        const $capitals = cheerio.load(fs.readFileSync('./capitals.html'));
            
        // iterate over capitals.html  
        
        $capitals('.div-col li').each((i, el) => {

            let locs = $capitals(el).find('a').attr('title').split(" (");
            let cap = $capitals(el).find('a').last().text();
            let abbr = $capitals(el).find('a').first().text();

            if (locs.length === 2) {
                locs.pop();
            }
            else if (locs[0] === "United States") {
                locs[0] = "District Of Columbia";
                cap = "D.C. is not a state and does not have a capital";
                abbr = "DC";
            }
            else if (locs[0] === "United States Virgin Islands") {
                locs[0] = "Virgin Islands";
            }
            
            locs.push('44', JSON.stringify([cap]));
            locations[abbr] = locs;
        });
        
        caplist = Object.values(locations).sort();
        
        // console.log(locations);
        // console.log(locations["GU"][0]);
        // console.log(capitals);

        
        // iterate over each div to get state/territory and governors

        // relevant structure for governors.html
        // <div class="bklyn-team-member-info">
        // <h3 class="bklyn-team-member-name">Alaska</h3>
        // <p class="bklyn-team-member-description">Gov. Mike Dunleavy</p>
        // </div>

        $governors('.bklyn-team-member-info').each((i, el) => {
            let location = $governors(el).find('.bklyn-team-member-name').text()
            let governor = $governors(el).find('.bklyn-team-member-description').text()
            let question_id = "43"
            // push arrays with question_id into govlist for geo table
            govlist.push([location, question_id, JSON.stringify([governor])]);
        });

        // add govlist answer for District Of Columbia.
        govlist.push([locations["DC"][0], '43', '["D.C. does not have a Governor"]']);

       


        // iterate over senators.html <member> tags to get senator first name, last name, and state
        // push arrays into senlist for geo table insert
        $senators('member').each((i, el) => {
            // $senators(el).find('last_name, first_name, state').each((i, elem) => {
            //     console.log($senators(elem)[i].text());
            //     templist.unshift($senators(el).text());
            // });

            let states = $senators(el).find('state').text();
            states = locations[states][0];
            
            // find first name and last name tags within parent <member> tag
            // map results into namelist object

            let namelist = $senators(el).find('first_name, last_name').map(function(i, el) {         
                let name = $senators(el).text();
                // for first_name tags with suffix included in the text, split by comma into an array [first, suffix]
                if (name.indexOf(',') > -1) {
                    name = name.split(', ');
                };
                // console.log(name);
                return name;
                // join last_name with [first_name, suffix], result is a list of arrays
                // reverse to reorder names
                }).get().join().split(',').reverse();
            
            // move suffixes to the end of the array
            if (namelist.length ===  3) {
                namelist.splice(0, 3, namelist[1], namelist[2], namelist[0]);
            };

            // join namelist values into a string for full name
            namelist = namelist.join(' ');
            
            // push results into one array
            senlist.push([states, '20', [namelist]]);
            
                // templist[0] = locations[templist[0]];
                // senlist.push(templist);
                // templist = [];
                // console.log($senators(el).text());
            });
            
        
        // create list of arrays for each state with senators merged into one stringified array
        // sort senator list by state
        senlist.sort();
        
        // iterate over senlist to match arrays containing the same state (two for each state)
        for (let i=0; i < senlist.length-1; i++) {
            
            // combine senator names into one array and remove duplicates
            if (senlist[i][0] === senlist[(i+1)][0]) {
                senlist[i][2].push(senlist[(i+1)][2][0]);
                senlist[i][2] = JSON.stringify(senlist[i][2]);
                senlist.splice((i+1), 1);
            };
        };

        // // loop over locations and senlist to get missing territories
        // for (values in locations) {
        //     let count;
        //     for (index in senlist) {
        //         if (locations[values][0] === senlist[index][0]) {
        //             // console.log(locations[values][0]);
        //             count = 1;
        //         };
        //     };
        //     // if count is not 1, territory is matched
        //     if (!(count === 1)) {
        //         // console.log(values);
        //         // insert answers for territories into senlist list
        //         if (values === "DC") {
        //             senlist.push([locations[values][0], '20', JSON.stringify(["D.C. has no U.S. Senators"])]);
        //         } else {
        //             senlist.push([locations[values][0], '20', JSON.stringify([locations[values][0] + " has no U.S. Senators"])]);
        //         };
        //     } else {
        //         count = 0;
        //     };
        // };
        
        // simpler version of loop over locations and senlist to get missing territories
        for (values in locations) {
            if (values === "AS" || values === "GU" || values === "MP" || values === "PR" || values === "VI") {
                senlist.push([locations[values][0], '20', JSON.stringify([locations[values][0] + " has no U.S. Senators"])]);
            }
            else if (values === "DC") {
                senlist.push([locations[values][0], '20', JSON.stringify(["D.C. has no U.S. Senators"])]);
            }
        };


        // console.log(senlist);
        // console.log(govlist);
        // console.log(caplist);

        let geolist = [caplist, govlist, senlist];
        return geolist;

    // end of try, catch
    }
    catch (err) {
        console.log(err)
    }
};

geo().then(geolist => {

    // connect to mysql database "citizen"
    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: "localhost",
        user: "foo",
        password: "bar",
        database: "citizen"
    });

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return
        }
        console.log('connected as id ' + connection.threadId);
    })

    // INSERT caplist INTO questions table
    var insert_caplist = "INSERT INTO geo (location, question_id, answer) VALUES ?";
    
    connection.query(insert_caplist, [geolist[0]], function(err) {
        if (err) throw err;
        console.log('caplist inserted into geo table.');
    })

    // INSERT govlist INTO geo table
    var insert_govlist = "INSERT INTO geo (location, question_id, answer) VALUES ?";
    
    connection.query(insert_govlist, [geolist[1]], function(err) {
        if (err) throw err;
        console.log('govlist inserted into geo table.');
    })

    // INSERT senlist INTO geo table
    var insert_senlist = "INSERT INTO geo (location, question_id, answer) VALUES ?";
    
    connection.query(insert_senlist, [geolist[2]], function(err) {
        if (err) throw err;
        console.log('senlist inserted into geo table.');
    })

    // Test query on geo table
    connection.query('SELECT location, question_id, answer FROM geo', function(err, rows, fields) {
        if (err) throw err;
        console.log(rows[1].location, rows[1].question_id, rows[1].answer);
    })

    // console.log(qa_list);

    connection.end();


})
.catch(err => console.error(err));






// Scrape geo websites and create html files for capitals, governors, and senators

// const geo_files = async() => {

//     const senators = {
//         uri: 'https://www.senate.gov/general/contact_information/senators_cfm.xml',
//         transform: function(body) {
//             return cheerio.load(body);
//         }
//     };

//     const capitals = {
//         // uri: 'https://simple.wikipedia.org/wiki/List_of_U.S._state_capitals',
//         uri: 'https://en.wikipedia.org/wiki/Template:US_state_capitals',
//         transform: function(body) {
//             return cheerio.load(body);
//         }
//     };

//     const governors = {
//         // uri: 'https://www.nga.org/governors',
//         uri: 'https://www.nga.org/governors',
//         transform: function(body) {
//             return cheerio.load(body);
//         }
//     };

//     try {
//         const $capitals = await request(capitals);
//         const $governors = await request(governors);
//         const $senators = await request(senators);
//         let files = [$capitals.html(), $governors.html(), $senators.html()];

//         return files;
//     }
//     catch (err) {
//         console.log(err);
//     }
// };

// geo_files().then(files => {

//     fs.writeFile("./capitals.html", files[0], function(err) {
//         if(err) {
//             return console.log(err);
//         }
//         console.log("The file capitals.html was saved!");
//     })

//     fs.writeFile("./governors.html", files[1], function(err) {
//         if(err) {
//             return console.log(err);
//         }
//         console.log("The file governors.html was saved!");
//     })

//     fs.writeFile("./senators.html", files[2], function(err) {
//         if(err) {
//             return console.log(err);
//         }
//         console.log("The file senators.html was saved!");
//     })

// })
// .catch(err => console.error(err));