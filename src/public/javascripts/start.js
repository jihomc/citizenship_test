// Show answer button
const showAnswerButton = document.getElementById("showAnswerButton");
// Answer list
const answerLi = document.getElementById("answerLi");
// AnswerList ul
const answerList = document.getElementById("answerList");
// Answer div id
const answer = document.getElementById("answer");
// list length
const list = document.getElementById("answerList").getElementsByTagName("li");

const shown = document.getElementsByClassName("shown");
let shownCount = 0;
let display = "flex";

document.addEventListener('DOMContentLoaded', function() {
    showAnswerButton.focus();
});

if ( list.length > 5 ) {

    // Keep list of answers longer than 33 characters
    let over33 = [];
    let long = false;

    var i=0;
    for (i; i < list.length; i++ ) {

        // Answers with character length > 50 will be displayed as 1 column
        if (list[i].innerText.length > 50) {
            long = true;
            break;

        // Append index of answers with > 33 characters to over33 list 
        } else if (list[i].innerText.length > 33) {
            over33.push(i);
        }
    } 
    
    // Switch to 1 column
    if (long === true) {
        answerList.classList.remove("columns");
        display = "flex";
        
    // Switch to 2 columns
    } else {
        
        // Increase line height for answers longer than 33 characters for formatting
        if (over33.length > 0) {
            for (const index of over33) {
                list[index].classList.add("answerLiHeight");
            }
        }
         
        answerList.classList.add("columns");
        display = "inline-block";
    }
    
// Less than 5 answers, display as 1 column
} else {
    answerList.classList.remove("columns");
    display = "flex";
}

function showhide() {
    // User clicked show answer
    if (showAnswerButton.innerHTML === "Show Answer") {
        showAnswerButton.innerHTML = "Hide Answer";
        answerList.style.display = `${display}`;
        shownCount += 1;
        shown[0].setAttribute('value', shownCount);
        shown[1].setAttribute('value', shownCount);
        nextQuestionButton.focus();
        
        // User clicked hide answer
    } else {
        showAnswerButton.innerHTML = "Show Answer";
        answerList.style.display = "none";
        event.preventDefault();
    }
}

showAnswerButton.addEventListener("click", showhide);