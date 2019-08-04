// const nextQuestionButton = document.querySelector("#nextQuestionButton");
const nextQuestionButton = document.getElementById("nextQuestionButton");
const showAnswerButton = document.getElementById("showAnswerButton");
// const answerList = document.getElementById("answerList");

document.addEventListener('DOMContentLoaded', function() {
    showAnswerButton.focus();
});

function showhide() {
    // 
    if (showAnswerButton.value === "hidden") {
        showAnswerButton.value = "showing";
        showAnswerButton.innerHTML = "Hide Answer";
        answerList.style.display = "block";
        // location.href = "#answer";
        nextQuestionButton.focus();
    } else {
        showAnswerButton.value = "hidden";
        showAnswerButton.innerHTML = "Show Answer";
        answerList.style.display = "none";
    }
}

showAnswerButton.addEventListener("click", showhide);

// nextQuestionButton.addEventListener("click", function() {
//     console.log("whatever");
// });