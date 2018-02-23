var actionButtonCharacter = "C";
var generatedMessageFormat = "%STORY_ID% [%TASK_ID%] %STORY_DESC% [%TASK_DESC%] ...";

function getTaskCards() {
    return $("div.task-card-actions-container");
}

function copy(message) {
    var $temp = $("<div>");
    $("body").append($temp);
    $temp.attr("contenteditable", true)
        .html(message).select()
        .on("focus", function() {
            document.execCommand('selectAll', false, null)
        })
        .focus();
    document.execCommand("copy");
    $temp.remove();
}

function generateAndCopyMessage() {
    var taskId = $.trim($("div.toolbar>h2").text()).replace("Task ", "");
    var taskDesc = $("h1.title textarea").text();

    var type;
    if ($("div.main-panel-scroller a[rel^='Story']").length > 0) {
        type = "Story";
    } else if ($("div.main-panel-scroller a[rel^='Defect']").length > 0) {
        type = "Defect";
    }
    var storyInternalId = $("div.main-panel-scroller a[rel^='" + type + "']")[0].rel;
    var storyId = $.trim($("tr[rowid='" + storyInternalId + "'] span.number").text());
    var storyDesc = $("div.main-panel-scroller a[rel^='" + type + "']>span").text();

    var message = generatedMessageFormat
        .replace("%STORY_ID%", storyId)
        .replace("%STORY_DESC%", storyDesc)
        .replace("%TASK_ID%", taskId)
        .replace("%TASK_DESC%", taskDesc);
    copy(message);

    // add notification here
}

function handleButtonClick(event) {
    var button = $(event.target);
    var taskCard = button.parents("div.task-card:first");
    taskCard.find("a.open-by-name.asset-name-link:first")[0].click();

    var nTimer = setInterval(function() {
        if ($("div.toolbar").length > 0) {
            clearInterval(nTimer);
            generateAndCopyMessage();
        }
    }, 300);
}

function addCopyActionButton() {
    $("a.version-ninja").remove();
    $("div.task-card").css("min-height", "5em");
    var taskActionsDivs = getTaskCards();
    taskActionsDivs.each(function(idx) {
        var button = $("<a></a>", {
            class: "task-card-actions version-ninja",
            text: actionButtonCharacter,
            title: "Copy to clipboard as commit message"
        });
        button.click(handleButtonClick);
        button.appendTo($(this));
    });
}

function loadSettings(callback) {
    browser.storage.local.get({
        actionButtonCharacter: "",
        generatedMessageFormat: ""
    }, function(items) {
        if (items.actionButtonCharacter !== "") {
            actionButtonCharacter = items.actionButtonCharacter;
        }
        if (items.generatedMessageFormat !== "") {
            generatedMessageFormat = items.generatedMessageFormat;
        }
        if (typeof callback === 'function') {
            callback();
        }
    });
}

function detectStorageChange(change) {
    loadSettings(addCopyActionButton);
}

function main() {
    browser.storage.onChanged.addListener(detectStorageChange);
    detectStorageChange();
}


$(function() {
    var nTimer = setInterval(function() {
        if (getTaskCards().length > 1) {
            clearInterval(nTimer);
            main();
        }
    }, 500);
});