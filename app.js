// This file is app.js which handles most of the functionality of the app including user inputs and interactions with
// the database

// Find all HTML elements using their ids
var headerTitle = document.getElementById("header-title");
var actionButtonsContainer = document.getElementById("action-buttons-container");

var confirmationDialog = document.getElementById("confirmation-dialog-box");
var confirmationDialogTitle = document.getElementById("confirmation-dialog-title");
var confirmationDialogText = document.getElementById("confirmation-dialog-text");
var confirmationRejectButton = document.getElementById("reject-button");
var confirmationAcceptButton = document.getElementById("accept-button");

var notificationBar = document.getElementById("notification");
var notificationBarText = document.getElementById("notification-text");
var notificationBarCloseButton = document.getElementById("notification-close-button");

//var navigationDashboardLink = document.getElementById("dashboard-link");
var navigationTimelineLink = document.getElementById("timeline-link");
var navigationGoalsLink = document.getElementById("goals-link");
//var navigationStatisticsLink = document.getElementById("statistics-link");
var navigationResourcesLink = document.getElementById("resources-link");
//var navigationCommentsLink = document.getElementById("comments-link");
var navigationAboutLink = document.getElementById("info-link");
var activeElements = document.getElementsByClassName("active");

// Set template for buttons in the menu bars
var selectBarTemplate = '<ul id="select-action-buttons" hidden>' +
            '<li><button id="select-cancel" title="Cancel"><i class="material-icons">clear</i></button></li>' +
            '<li><button id="select-delete" title="Delete"><i class="material-icons">delete</i></button></li>' +
            '</ul>';

// Database code
var database = openDatabase("musicLessonTrackerDatabase", 1, "Music lesson tracker database", 2 * 1024 * 1024);
// The transaction containing SQL that creates the tables
database.transaction(function (transaction) {
    // Creates the practiceSessions table that will store all the practice sessions that the user adds on the timeline screen
    transaction.executeSql("CREATE TABLE IF NOT EXISTS practiceSessions(sessionID INTEGER PRIMARY KEY AUTOINCREMENT, date DATE, length TIME, type TEXT, comment TEXT);", [], function () {
        // Code in the function runs when the SQL ran successfully
        console.log("practiceSessions table created");
    }, function () {
        // Code in the function runs when the SQL ran unsuccessfully
        console.log("Error creating practiceSessions table");
        });
    // Creates the goals table that will contain the goals that the user adds on the goals screen
    transaction.executeSql("CREATE TABLE IF NOT EXISTS goals(goalID INTEGER PRIMARY KEY AUTOINCREMENT, objective TEXT, date DATE, length TIME, details TEXT);", [], function () {
        // Code in the function runs when the SQL ran successfully
        console.log("goals table created");
    }, function () {
        // Code in the function runs when the SQL ran unsuccessfully
        console.log("Error creating goals table");
    });
});

// Adds a new practice session to the practiceSessions table
function addPracticeSession(date, length, type, comment) {
    database.transaction(function (transaction) {
        transaction.executeSql("INSERT INTO practiceSessions(date, length, type, comment) VALUES(?, ?, ?, ?);", [date, length, type, comment],
            function () {
                // Code in the function runs when the SQL ran successfully
                showNotification("Practice session added");
            }, function () {
                // Code in the function runs when the SQL ran unsuccessfully
                showNotification("Error: Practice session not added");
            });
    });
}

// Creates an array of the practice sessions from the database
var sessions = [];
database.transaction(function (transaction) {
    transaction.executeSql("SELECT * FROM practiceSessions ORDER BY date DESC", [],
        function (transaction, results) {
            // Code in the function runs when the SQL ran successfully
            for (var i = 1; i < results.rows.length + 1; i++) {
                sessions.push(results.rows.item(i - 1));
            }
        },
        function () {
            // Code in the function runs when the SQL ran unsuccessfully
            showNotification("Error: Could not get practice sessions from database");
        });
});

// Returns the array (list) of practice sessions from the table
function readAllSessions() {
    return sessions;
}

// Updates a practice session in the table given its ID
function updatePracticeSession(id, date, length, type, comment) {
    database.transaction(function (transaction) {
        transaction.executeSql("UPDATE practiceSessions SET date = ?, length = ?, type = ?, comment = ? WHERE sessionID = ?;", [date, length, type, comment, id],
            function () {
                // Code in the function runs when the SQL ran successfully
                showNotification("Practice session updated");
            }, function () {
                // Code in the function runs when the SQL ran unsuccessfully
                showNotification("Error: practice session not updated");
            });
    });
}

// Deletes the practice session specified using its ID
function deletePracticeSession(id) {
    database.transaction(function (transaction) {
        transaction.executeSql("DELETE FROM practiceSessions WHERE sessionID = ?", [id],
            function () {
                // Code in the function runs when the SQL ran successfully
                showNotification("Practice session deleted");
            }, function () {
                // Code in the function runs when the SQL ran unsuccessfully
                showNotification("Error: Practice session not deleted");
            });
    });
}

// Adds a goal to the goals table
function addGoal(objective, date, length, details) {
    database.transaction(function (transaction) {
        transaction.executeSql("INSERT INTO goals(objective, date, length, details) VALUES(?, ?, ?, ?);", [objective, date, length, details],
            function () {
                // Code in the function runs when the SQL ran successfully
                showNotification("Goal added");
            }, function () {
                // Code in the function runs when the SQL ran unsuccessfully
                showNotification("Error: Goal not added");
            });
    });
}

var goals = [];
database.transaction(function (transaction) {
    transaction.executeSql("SELECT * FROM goals", [],
        function (transaction, results) {
            // Code in the function runs when the SQL ran successfully
            for (var i = 1; i < results.rows.length + 1; i++) {
                goals.push(results.rows.item(i - 1));
            }
        }, function () {
            // Code in the function runs when the SQL ran unsuccessfully
            showNotification("Error: Could not get goals from database");
        });
});

// Returns an array (a list) of all goals in the goals table
function readAllGoals() {
    return goals;
}

// 
function updateGoal(id, objective, date, length, details) {
    database.transaction(function (transaction) {
        transaction.executeSql("UPDATE goals SET objective = ?, date = ?, length = ?, details = ? WHERE goalID = ?;", [objective, date, length, details, id],
            function () {
                // Code in the function runs when the SQL ran successfully
                showNotification("Goal updated");
            }, function () {
                // Code in the function runs when the SQL ran unsuccessfully
                showNotification("Error: Goal not updated");
            });
    });
}

function deleteGoal(id) {
    database.transaction(function (transaction) {
        transaction.executeSql("DELETE FROM goals WHERE goalID = ?;", [id],
            function () {
                // Code in the function runs when the SQL ran successfully
                showNotification("Goal deleted");
            }, function () {
                // Code in the function runs when the SQL ran unsuccessfully
                showNotification("Error: Goal not deleted");
            });
    });
}

// Runs when the app initially loads
window.addEventListener("load", () => {
    // Check if the browser supports service workers
    if (!("serviceWorker" in navigator))
        console.log("Service worker not supported");
    else {
        // Register the service worker using the service-worker.js file
        navigator.serviceWorker.register("service-worker.js")
            .then(registration => {
                console.log("Service worker registered. Scope:", registration.scope);
            }).catch(error => {
                console.error("Service worker registration failed. ", error);
            });
    }
    // Changes the page of the app based on which icon the user selected
    switch (activeElements[0].id) {
        case "timeline-link":
            changeTab(navigationTimelineLink, "timeline.html");
            break;
        case "goals-link":
            changeTab(navigationGoalsLink, "goals.html");
            break;
        //case "statistics-link":
        //    changeTab(navigationStatisticsLink, "statistics");
        //    break;
        case "resources-link":
            changeTab(navigationResourcesLink, "resources.html");
            break;
        //case "comments-link":
        //    changeTab(navigationCommentsLink, "comments.html");
        //    break;
        case "info-link":
            changeTab(navigationAboutLink, "about.html");
            break;
        default:
    }
});

// Runs when the reject button is clicked in the confirmation dialog box
confirmationRejectButton.addEventListener("click", () => {
    // Hides the confirmation dialog
    confirmationDialog.style.display = "none";
});

// Runs when the accept button is clicked in the confirmation dialog box
confirmationAcceptButton.addEventListener("click", () => {
    // Hides the confirmation dialog
    confirmationDialog.style.display = "none";
});

// Runs when the close button is clicked on the notification bar
notificationBarCloseButton.addEventListener("click", () => {
    // Hides the notification bar
    notificationBar.style.display = "none";
});

// Runs when the timeline link is clicked
navigationTimelineLink.addEventListener("click", () => {
    if (!navigationTimelineLink.classList.contains("active"))
        changeTab(navigationTimelineLink, "timeline.html");
});

// Runs when the goals link is clicked
navigationGoalsLink.addEventListener("click", () => {
    if (!navigationGoalsLink.classList.contains("active"))
        changeTab(navigationGoalsLink, "goals.html");
});

// Runs when the resources link is clicked
navigationResourcesLink.addEventListener("click", () => {
    if (!navigationResourcesLink.classList.contains("active"))
        changeTab(navigationResourcesLink, "resources.html");
});

// Runs when the about link is clicked
navigationAboutLink.addEventListener("click", () => {
    if (!navigationResourcesLink.classList.contains("active"))
        changeTab(navigationAboutLink, "about.html");
});

// Navigates to the specified tab and changes the name of the tab displayed in the action bar at the top of the screen
function changeTab(tab, newFileName) {
    while (activeElements.length)
        activeElements[0].className = activeElements[0].className.replace(/\bactive\b/g, "");
    tab.classList.toggle("active");
    $("#main").load("app-pages/" + newFileName);
}

// Shows the notification bar with the specified message
function showNotification(message) {
    notificationBarText.innerHTML = message;
    notificationBar.style.display = "block";
}

// Shows the confirmation dialog box with the specified title and message
function showConfirmationDialog(title, message) {
    // Display the given title in the title paragraph
    confirmationDialogTitle.innerHTML = title;
    // Display the given message in the paragraph just below the title
    confirmationDialogText.innerHTML = message;
    // Display the dialog
    confirmationDialog.style.display = "block";
}

// Used so that the selected card can be accessed on the timeline edit screen
var selectedCard;
function editPracticeSession(card) {
    selectedCard = card;
    console.log(selectedCard);
}

// Used so that the selected goal can be accessed on the goal edit screen
var selectedGoal;
function editGoal(card) {
    selectedGoal = card;
    console.log(selectedGoal);
}