console.log(".~. begin .~.");

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

    var message = storyId + " [" + taskId + "] " + storyDesc + " [" + taskDesc + "] ...";
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
    $("div.task-card").css("min-height", "5em");
    var taskActionsDivs = getTaskCards();
    taskActionsDivs.each(function(idx) {
        var button = $("<a></a>", {
            class: "task-card-actions version-ninja",
            text: "C",
            title: "Copy to clipboard as commit message"
        });
        button.click(handleButtonClick);
        button.appendTo($(this));
    });
}

function main() {
    $("a.version-ninja").remove();
    addCopyActionButton();
}


$(function() {
    var nTimer = setInterval(function() {
        if (getTaskCards().length > 1) {
            clearInterval(nTimer);
            main();
        }
    }, 500);
});

console.log("+#+ end +#+");