import { REPLServer } from "repl";
import { Z_PARTIAL_FLUSH } from "zlib";
import { SIGPIPE } from "constants";

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


// Step 1: Scrape member data from house.gov http://clerk.house.gov/xml/lists/MemberData.xml
// Step 2: Update geo question_id 23 answer with list of all possible reps

    // IF territory = territory has no (voting) Representatives in Congress OR name Delegate or Commissioner
    // IF Alaska || Delaware || D.C. || Montana || North Dakota || South Dakota || Vermont || Wyoming AT LARGE 1 Rep

<member>
    <statedistrict>ID01</statedistrict>
    <member-info>
        <official-name>
            Russ Fulcher
        </official-name>
        <state postal-code="ID">
            <state-fullname>Idaho</state-fullname>
        </state>
        <district>1st</district>
    </member-info>
</member>

[location, question_id, [reps]]

// state_fips object

state_fips = {  06: "California",
                01: "Alabama"
             };

// Step 2.5 - build rep / district object from house.gov xml

reps = {"California": {
            05: "Mike Thompson",
            11: "MArk DeSaulnier"
        },
        "Alabama": {
            06: "Gary J. Palmer",
            07: "Terri A. Sewell"
        },
    };

// Step 3: Build zip table 
// location and zip as primary keys, ignore case when state is different
// 06 = California
list = [ [06,94803,05],
         [06,94803,11] ];


 ['California', 06, 94803, [05, 11], ["Mike Thompson", "Mark DeSaulnier"]];

 [06, 94803, [05, 11]];
 
 state_fips[06] = "California"

object = {"California": {
                94803: [05, 11]
            },
            "Alabama": {
                35004: 03,
                35005: [06, 07]
            }
        };
        
// 



// zip match different state, ignore case?

01,30165,03
13,30165,14




// with locations, rep names, and district id

// Part 2: map all zip codes to congressional district and state
// compile states with all zip codes and congressional districts


// zip codes unique, states or districts might not be



// build with 


