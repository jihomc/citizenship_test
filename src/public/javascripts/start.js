// Show answer button
const showAnswerButton = document.getElementById("showAnswerButton");
// Next question button
const nextQuestionButton = document.getElementById("nextQuestionButton");
// Answer list unordered list 
const answerList = document.getElementById("answerList");
// Answer list length
const list = document.getElementById("answerList").getElementsByTagName("li");
// Shown class used for keeping track of answers shown
const shown = document.getElementsByClassName("shown");

let shownCount = 0;
let display = "flex";

// Focus on the show answer button when page finishes loading
document.addEventListener('DOMContentLoaded', function() {
    showAnswerButton.focus();
});

// Format the answer list display when greater than five
if ( list.length > 5 ) {

    // Array to keep track of answers longer than 33 characters
    let over33 = [];
    let long = false;


    // Iterate over each answer for character length
    var i=0;
    for (i; i < list.length; i++ ) {

        // Set long to true if any answer has more than 50 characters
        if (list[i].innerText.length > 50) {
            long = true;
            break;

        // Append answers longer than 33 characters to the over33 list
        } else if (list[i].innerText.length > 33) {
            over33.push(i);
        }
    } 
    
    // Display the answers in 1 column if long is true 
    if (long === true) {
        answerList.classList.remove("columns");
        display = "flex";
        
    // If long is false, display answers in 2 columns
    } else {
        
        // For answers longer than 33 characters, add css class to format line height
        if (over33.length > 0) {
            for (const index of over33) {
                list[index].classList.add("answerLiHeight");
            }
        }
         
        // Add css class to display 2 columns
        answerList.classList.add("columns");
        display = "inline-block";
    }
    
// Display 1 column if less than 5 answers
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