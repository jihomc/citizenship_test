const nextQuestionButton = document.getElementById("nextQuestionButton");
const showAnswerButton = document.getElementById("showAnswerButton");
const shown = document.getElementById("shown");

document.addEventListener('DOMContentLoaded', function() {
    showAnswerButton.focus();
});

function showhide() {
    // User clicked show answer
    if (showAnswerButton.value === "hidden") {
        showAnswerButton.value = "showing";
        showAnswerButton.innerHTML = "Hide Answer";
        answerList.style.display = "block";
        nextQuestionButton.focus();
        shown.value = "yes";
        // location.href = "#answer";
    // User clicked hide answer
    } else {
        showAnswerButton.value = "hidden";
        showAnswerButton.innerHTML = "Show Answer";
        answerList.style.display = "none";
    }
}

showAnswerButton.addEventListener("click", showhide);
