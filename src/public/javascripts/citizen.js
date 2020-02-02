// Location selected by user from the dropdown menu
const selector = document.getElementById("selectLocation");
// User's location after hitting set location button
const userLocation = document.getElementById("userLocation");
// Label for location select dropdown menu 
const selectLabel = document.getElementById("selectLabel");
// Div containing the form element for zip, hidden by default
const zipContainer = document.getElementById("zipContainer");
// Form input requiring zip from user 
const selectZip = document.getElementById("selectZip");
// Set Location Button 
const setLocationButton = document.getElementById("setLocationButton");
// Start button
const startButton = document.getElementById("startButton");
// Validation error
const validationError = document.getElementById("error");

// Display the answer list as a block if location is selected
document.addEventListener('DOMContentLoaded', function() {

    if (validationError) {
        zipContainer.style.display = "block";
        setLocationButton.style.display = "inline-block";
        selectZip.focus();
    } else if (startButton) {
       startButton.focus(); 
    } else {
        selector.focus();
    }

});

// When user selects a location, determine if a zip code is required
// If zip code is required, prompt the user to enter their zip code
if (selector) {

    selector.addEventListener("change", function() {

        // If no location is selected, prompt the user to choose a location
        if (selector.value === "Select location") {

            selectLabel.innerHTML = "Choose your location: "
            selectZip.disabled = true;
            zipContainer.style.display = "none";
            setLocationButton.style.display = "none";

            if (validationError) {
                validationError.style.display = "none";
            }

        } else {
            setLocationButton.style.display = "inline-block";
            selectLabel.innerHTML = "Your location is: ";
            
            // Location requires zip code
            if (!(selector.value === "American Samoa" || selector.value === "District Of Columbia" ||
            selector.value === "Guam" || selector.value === "Northern Mariana Islands" ||
            selector.value === "Puerto Rico" || selector.value === "Virgin Islands" ||
            selector.value === "Alaska" || selector.value === "Delaware" || selector.value === "Montana" ||
            selector.value === "North Dakota" || selector.value === "South Dakota" ||
            selector.value === "Vermont" || selector.value === "Wyoming")) {

                selectZip.disabled = false;
                zipContainer.style.display = "block";
                selectZip.focus();

            // Territory or District at Large (DAL) is selected, do not ask for zip code
            } else {

                selectZip.disabled = true;
                zipContainer.style.display = "none";
                setLocationButton.focus();

            }
        }

    });
}