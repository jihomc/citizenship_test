// [Residents of territories with nonvoting Delegates or Resident Commissioners may provide 
// the name of that Delegate or Commissioner. Also acceptable is any statement that the 
// territory has no (voting) Representatives in Congress.]

// Resources
// Directory of Representatives: https://www.house.gov/representatives
// Govtrack.us Representatives: https://www.govtrack.us/congress/members/current
// Census.gov Congressional Districts by Zip Code: https://www2.census.gov/geo/relfiles/cdsld18/natl/natl_zccd_delim.txt?#
// House.gov memberdata xml file: http://clerk.house.gov/xml/lists/MemberData.xml

// Checklist:
// Zip codes
// Rep. Full Name
// location
// question_id

const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const fips = require('./fips_states.js');

// array format
let replist = [];
let ziplist = [];
// object format
let repobj = {};
let zipobj = {};

// scrape member data from house.gov http://clerk.house.gov/xml/lists/MemberData.xml
// scrape natl_zccd_delim.txt from census.gov
// write html to files, load into cheerio and return results for parsing


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
        if (!(fs.existsSync('./reps.html'))) {
            // if files do not exist
            // *need to add a way to check for updates*
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
        
        const $reps = await cheerio.load(fs.readFileSync('./reps.html'), {
            xmlMode: true
        });
        const $zips = await cheerio.load(fs.readFileSync('./zips.html'));

        results = [$reps, $zips];
        return results;
    }
    catch (err) {
        console.log(err);
    }
};

// Step 2: Update geo question_id 23 answer with list of all possible reps

    // IF territory = territory has no (voting) Representatives in Congress OR name Delegate or Commissioner
    // IF Alaska || Delaware || D.C. || Montana || North Dakota || South Dakota || Vermont || Wyoming AT LARGE 1 Rep

build_reps().then(results => {
    
    // results[0] = house members, results[1] = census zips
    
    // Part 1: build rep / district object from house.gov xml

    // house member list
    // [question_id, location, district_id, rep]
    
    // <member>
    // <statedistrict>ID01</statedistrict>
    // <member-info>
    //     <official-name>
    //         Russ Fulcher
    //     </official-name>
    //     <state postal-code="ID">
    //         <state-fullname>Idaho</state-fullname>
    //     </state>
    //     <district>1st</district>
    // </member-info>
    // </member>

    
    const $replist = cheerio.load(results[0].html());
    // console.log($replist.html());
    // console.log(results[0]);
    // console.log($replist.html());

    $replist('member-info').each((i, el) => {
        console.log($replist(el).find('official-name').text().length);
        console.log($replist(el).find('official-name').text());
        // if (($replist(el).find('official-name').length) === 0) {
        //     console.log("the value is 0");
        //     console.log($replist(el).find('statedistrict').text());
            
        // } else {
        //     // console.log($replist(el).find('official-name').text());
        // }
        // console.log($replist(el).find('official-name').length();
    });
    
    




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
    
//     let ziplist = results[1].html().split('\n');
//     ziplist.shift(), ziplist.shift();

//     for (rows in ziplist) {
//         ziplist[rows] = ziplist[rows].split(',');
//         // ziplist[rows][0] = fips[ziplist[rows][0]];
//         // match code to fps object and insert state into row
//         ziplist[rows].unshift(fips[ziplist[rows][0]]);
//     };
//     console.log(ziplist);

})
.catch(err => console.log(err));






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
        


