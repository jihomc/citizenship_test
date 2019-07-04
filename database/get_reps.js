// question_id 23 - Who is your representative?
    // [Residents of territories with nonvoting Delegates or Resident Commissioners may provide 
    // the name of that Delegate or Commissioner. Also acceptable is any statement that the 
    // territory has no (voting) Representatives in Congress.]

// Resources
    // House.gov memberdata xml file: http://clerk.house.gov/xml/lists/MemberData.xml
    // Census.gov Congressional Districts by Zip Code: https://www2.census.gov/geo/relfiles/cdsld18/natl/natl_zccd_delim.txt?#

// Checklist:
    // Zip codes
    // Rep. Full Name
    // location
    // question_id

const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const fips = require('./fips_states.js');

let question_id = '23';

let replist = [];
let ziplist = [];

// Step 1: scrape house and census website to get reps and zips

const build_reps = async() => {

    const get_reps = {
                uri: 'http://clerk.house.gov/xml/lists/MemberData.xml',
                transform: function(body) {
                    return cheerio.load(body);
                }
            };
    
    const get_zips = {
        uri: 'https://www2.census.gov/geo/relfiles/cdsld18/natl/natl_zccd_delim.txt',
        transform: function(body) {
            return cheerio.load(body);
            }
        };
    
    try {

        // if file does not exist, create new file

        if (!(fs.existsSync('./reps.html'))) {
            const $get_reps = await request(get_reps);
            const $get_zips = await request(get_zips);

            fs.writeFile("./reps.html", $get_reps.html(), function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file reps.html was saved!");
            })

            fs.writeFile("./zips.html", $get_zips.html(), function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file zips.html was saved!");
            })
        }
        
        // load reps.html and zips.hmtl files into cheerio

        const $reps = await cheerio.load(fs.readFileSync('./reps.html'), {
            xmlMode: true
        });
        const $zips = await cheerio.load(fs.readFileSync('./zips.html'));
        

        // build rep list
            // all states, districts, and rep names with question id
            // [state, district, rep_name, question_id]
    
        $reps('member').each((i, el) => {  

            // get rep names
            let rep_name = $reps(el).find('official-name');
            
            // if there is a vacancy, <official-name/> is empty but has a child node and footnote text
            if (rep_name.children().length > 0) {
                // replist.push("Vacancy");
                rep_name = "Vacancy";
            } else {
                rep_name = rep_name.text();
            };
    
            let district = $reps(el).find('statedistrict').text();
            district = district.slice(2, 4);

            let state = $reps(el).find('state-fullname').text();
            
            replist.push([state, district, rep_name, question_id]);
            
    
        });

        
        // Build zip list
            // all states, zip codes, and congressional congressional districts
            // [state, fips, zip, district]
        
        // create zipdata array from string results, split by spacing
        zipdata = $zips.html().split('\n');

        // remove title and description from beginning of array, empty quote at the end
        zipdata.shift(), zipdata.shift(), zipdata.pop();

        for (rows in zipdata) {

            // split text values into array
            zipdata[rows] = zipdata[rows].split(',');

            // replace fips number with state name
            zipdata[rows][0] = fips[zipdata[rows][0]];

            // turn district into an array
            zipdata[rows][2] = [zipdata[rows][2]];

        };
        
        // for each element in zipdata, push into ziplist and merge duplicates for state and zip code
        zipdata.forEach(function(element) {
            
            if (ziplist.length === 0) {
                ziplist.push(element);

            // match 0 and 1 index of element with last element of ziplist, concatenating district
            } else if (element[0] === ziplist[ziplist.length-1][0] && element[1] === ziplist[ziplist.length-1][1]) {
                // console.log(ziplist[ziplist.length-1][2]);

                ziplist[ziplist.length-1][2] = JSON.parse([ziplist[ziplist.length-1][2]]);
                // console.log(ziplist[ziplist.length-1][2]);
                // console.log(ziplist[ziplist.length-1]);

                ziplist[ziplist.length-1][2].push(element[2][0]);
                // console.log(ziplist[ziplist.length-1]);

                // ziplist[ziplist.length-1][2] = JSON.stringify(ziplist[ziplist.length-1][2]);
                // console.log(ziplist[ziplist.length-1]);
            } else {

                ziplist.push(element);
            }
            ziplist[ziplist.length-1][2] = JSON.stringify(ziplist[ziplist.length-1][2]); 
            // console.log(ziplist[ziplist.length-1]);
        });

        // console.log(zipdata);
        console.log(ziplist.slice(-5));
        // console.log(replist);
        




        results = [replist, ziplist];
        return results;
    }
    catch (err) {
        console.log(err);
    }
};


build_reps().then(results => {
    
    // connect to mysql
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

    // INSERT replist INTO reps table
    var insert_replist = "INSERT INTO reps (location, district, representative, question_id) VALUES ?";
    
    connection.query(insert_replist, [results[0]], function(err) {
        if (err) throw err;
        console.log('replist inserted into reps table.');
    })

    // INSERT ziplist INTO zips table
    var insert_ziplist = "INSERT INTO zips (location, zip_code, districts) VALUES ?";
    // console.log(results[1]);
    connection.query(insert_ziplist, [results[1]], function(err) {
        if (err) throw err;
        console.log('ziplist inserted into zips table.');
    })
    
    // Test query on reps table
    connection.query('SELECT * FROM reps', function(err, rows, fields) {
        if (err) throw err;
        // console.log(rows[0].location, rows[0].question_id, rows[0].answer);
        console.log(rows);
    })

    // Test query on zips table
    connection.query('SELECT * FROM zips', function(err, rows, fields) {
        if (err) throw err;
    
        console.log(rows);
    })

    

    connection.end();

                    
})
.catch(err => console.log(err));
                






 // console.log(results[0]);
    // console.log(results[1]);

    // const $replist = cheerio.load(results[0].html());
    
    // $replist('member').each((i, el) => {
    //     // if there is a vacancy, <official-name/> is empty but has a child node and footnote text
        
    //     // get official names
    //     let rep_name = $replist(el).find('official-name');
        
    //     if (rep_name.children().length > 0) {
    //         // replist.push("Vacancy");
    //         rep_name = "Vacancy";
    //     } else {
    //         rep_name = rep_name.text();
    //     };
        
    //     let district = $replist(el).find('statedistrict').text();
    //     district = district.slice(2, 4);
    //     let state = $replist(el).find('state-fullname').text();
        
    //     replist.push([state, district, rep_name, question_id]);
            
    // });
                
    // console.log(replist);
                
                
                
                
    // Part 2: Build zip table
    // compile states with all zip codes and congressional districts
    
    // location(state) and zip as primary keys, ignore case when state is different
    // 06 = California
    
    // same zip different state
    // 01,30165,03
    // 13,30165,14
    
    //  ['California', 06, 94803, [05, 11], ["Mike Thompson", "Mark DeSaulnier"]];
    
    //  [06, 94803, [05, 11]];
    
    
    
    //     create array of results from text, split by spacing
    //     remove title and description from array
    
    //     let zipdata = results[1].html().split('\n');
    //     zipdata.shift(), zipdata.shift();
    
    //     for (rows in zipdata) {
        //         zipdata[rows] = zipdata[rows].split(',');
        //         // zipdata[rows][0] = fips[zipdata[rows][0]];
        //         // match code to fps object and insert state into row
        //         zipdata[rows].unshift(fips[zipdata[rows][0]]);
        //     };
        //     console.log(zipdata);
                    





                
                // IF territory = territory has no (voting) Representatives in Congress OR name Delegate or Commissioner
// IF Alaska || Delaware || D.C. || Montana || North Dakota || South Dakota || Vermont || Wyoming AT LARGE 1 Rep

                // Update geo question_id 23 answer with list of all possible reps
                
                
                
                // Possible JSON objects
                
                // reps = {"California": {
                    //             05: "Mike Thompson",
                    //             11: "MArk DeSaulnier"
                    //         },
                    //         "Alabama": {
                        //             06: "Gary J. Palmer",
                        //             07: "Terri A. Sewell"
                        //         },
                        //     };


// object = {"California": {
//                 94803: [05, 11]
//             },
//             "Alabama": {
//                 35004: 03,
//                 35005: [06, 07]
//             }
//         };