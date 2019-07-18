var selector = document.getElementById("selectLocation");
var zipContainer = document.getElementById("zipContainer");
var selectZip = document.getElementById("selectZip");
//var selectZipLabel = document.getElementById("selectZipLabel");
//var startContainer = document.getElementById("startContainer");
var selectLocationLabel = document.getElementById("selectLabel");
var currentLocation = "";
var currentZip = "";
var question = document.querySelector("#question");
var answer = document.querySelector("#answer");
var nextQuestionButton = document.querySelector("#nextQuestionButton");
var showAnswerButton = document.querySelector("#showAnswerButton");
var startButton = document.querySelector("#startButton");
var resetButton = document.querySelector("#resetButton");

var answerList = document.getElementById("answerList");




selector.addEventListener("change", function() {
    //nextQuestionButton.focus();
    if (selector.value === "") {
        selectLabel.innerHTML = "Choose your location: "
    } else {
        selectLabel.innerHTML = "Your Location is: ";
        //currentLocation = selector.options[selector.selectedIndex].text;
        if (!(selector.value === "American Samoa" || selector.value === "District of Columbia" || selector.value === "Guam" || selector.value === "Northern Mariana Islands" || selector.value === "Puerto Rico" || selector.value === "Virgin Islands")) {
            zipContainer.style.display = "block";
            selectZip.focus();
        } else {
            zipContainer.style.display = "none";
            selectZip.value = ""; // Sets zip code to "" if entered before selecting a non-voting territory.
        }
        startButton.style.display = "inline-block";
    }
});


var keys = [];
for (var key in answerKey) {
    if (answerKey.hasOwnProperty(key)) {
        keys.push(key);
}}

let i = 0;
nextQuestionButton.addEventListener("click", nextQuestion);
showAnswerButton.addEventListener("click", showhide);
startButton.addEventListener("click", start);
resetButton.addEventListener("click", reset);

function start() {
    currentLocation = selector.options[selector.selectedIndex].text;
    currentZip = selectZip.value;
    if (currentZip === "") {
        selectLocationLabel.innerHTML = "Location: " + currentLocation;
    } else {
        selectLocationLabel.innerHTML = "Location: " + currentLocation + " || " + "Zip Code: " + currentZip;
    }
    startButton.style.display = "none";
    resetButton.style.display = "inline-block";
    showAnswerButton.style.display = "inline-block";
    nextQuestionButton.style.display = "inline-block";
    selector.style.display = "none";  
    zipContainer.style.display = "none";
    //selectZip.style.display = "none";
    //electZipLabel.innerHTML = "Zip Code: " + currentZip;
    nextQuestion();
    updateAnswerKey();
}

function reset() {
    i = 0;
    while (answerList.firstChild) {
        answerList.removeChild(answerList.firstChild);
    }
    answerList.textContent = "Answer: This is the answer";
    showAnswerButton.style.display = "none";
    nextQuestionButton.style.display = "none";
    resetButton.style.display = "none";
    selector.style.display = "inline-block";
    selector.value = "";
    selectZip.value = "";
    answer.style.display = "block";
    selectLocationLabel.innerHTML = "Choose your location: ";
    question.textContent = "Question: How many States are there?";
    //answer.textContent = "Answer: This is the answer.";
    currentZip = "";
    currentLocation = "";
}

function updateAnswerKey() {
    for (var key in testUpdatesGen) {
        answerKey[key] = testUpdatesGen[key];
    }
    updateGeoKey();
    // if (!(currentZip === "")) {
        //     updateGeoKey();
        // }
    }
    
    function updateGeoKey() {
        for (var geokey in testUpdatesGeo[currentLocation]) {
            answerKey[geokey] = testUpdatesGeo[currentLocation][geokey];
        }
    }
    
    
    function nextQuestion() {
        if (i < Object.keys(answerKey).length) {
            // alert(i);
            question.textContent = keys[i];
            //answer.textContent = answerKey[keys[i]];
            answerStr = answerKey[keys[i]];
            buildAnswerList(answerStr);
            answer.style.display = "none";
            nextQuestionButton.innerHTML = "Next Question";
            showAnswerButton.innerHTML = "Show Answer";
            showAnswerButton.value = "hide";
            showAnswerButton.focus();
            i++;
            if (i >= keys.length) {
                nextQuestionButton.innerHTML = "Finish";
            }
        } else {
            finished();
        }
    }
    
    function buildAnswerList(answerStr) {
        while (answerList.firstChild) {
            answerList.removeChild(answerList.firstChild);
        }
        if (typeof answerStr === "string") {
            //answer.textContent = answerStr;
            var entry = document.createElement("li");
            entry.appendChild(document.createTextNode(answerStr));
            entry.setAttribute("style", "list-style: none;");
            answerList.appendChild(entry);
            
        } else {
            for (item in answerStr) {
                var entry = document.createElement("li");
                entry.appendChild(document.createTextNode(answerStr[item]));
                answerList.appendChild(entry);
            }
        }
        //var splitvar = answerStr.split(",");
        //return answerList;
    }
    
    
    function showhide() {
        if (showAnswerButton.value === "hide") {
            showAnswerButton.value = "show";
            showAnswerButton.innerHTML = "Hide Answer";
            answer.style.display = "block";
            location.href = "#answer";
            nextQuestionButton.focus();
        } else {
            showAnswerButton.value = "hide";
            showAnswerButton.innerHTML = "Show Answer";
            answer.style.display = "none";
        }
    }
    
    
function finished() {
    alert("Finished");
    question.textContent = "Finished!";
    answer.style.display = "none";
    showAnswerButton.style.display = "none";
    nextQuestionButton.innerHTML = "Restart";
    i = 0;
}
