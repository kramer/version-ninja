function onError(error) {
    console.log(`Error: ${error}`);
}

function notifyStatusChange(newStatus) {
    let status = document.getElementById("status");
    status.textContent = newStatus;
    //Clear the notification after a second
    setTimeout(function() {
        status.textContent = "";
    }, 2500);
}

function optionsChanged() {
    let actionButtonCharacter = document.getElementById("actionButtonCharacter").value;
    let generatedMessageFormat = document.getElementById("generatedMessageFormat").value;

    let optionData = {
        actionButtonCharacter: actionButtonCharacter,
        generatedMessageFormat: generatedMessageFormat
    }

    browser.storage.local.set(optionData).then(null, onError);
    notifyStatusChange("Options saved!");
}

function restoreOptions() {
    browser.storage.local.get({
        actionButtonCharacter: "",
        generatedMessageFormat: ""
    }, function(items) {
        if (items.actionButtonCharacter === "") {
            items.actionButtonCharacter = "C";
        }

        if (items.generatedMessageFormat === "") {
            items.generatedMessageFormat = "%STORY_ID% [%TASK_ID%] %STORY_DESC% [%TASK_DESC%] ...";
        }

        document.getElementById("actionButtonCharacter").value = items.actionButtonCharacter;
        document.getElementById("generatedMessageFormat").value = items.generatedMessageFormat;
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("optionsForm").addEventListener("change", optionsChanged);