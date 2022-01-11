var actionButtonCharacter = "C";
var generatedMessageFormat = "%STORY_ID% [%TASK_ID%] %STORY_DESC% [%TASK_DESC%] ...";

function getTaskCards() {
    return $("div.task-card-actions-container");
}

function copy(message) {
    navigator.clipboard.writeText(message).then(function() {
        console.log("Message copied to clipboard successfully!");
    }, function() {
        console.error("Unable to write message to clipboard. :-(");
    });
}

function injectScriptToPage(func) {
    var actualCode = '(' + func + ')();'
	var script = document.createElement('script');
	script.textContent = actualCode;
	(document.head||document.documentElement).appendChild(script);
	script.remove();
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

	injectScriptToPage(function() { 
		$("div.toolbar>h2").qtip({
			content: 'Commit message copied to clipboard!',
	    	style: 'qtip-light qtip-rounded qtip-shadow',
	        position: {
	        	my: 'top left',
	        	at: 'bottom right'
	    	},
	    	show: true,
	    	hide: {
		        event: 'click mouseleave',
                delay: 300,
        		inactive: 1000
		    }
	     });
	});
}

function handleButtonClick(event) {
	event.stopPropagation();
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
    chrome.storage.local.get({
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

function addWrapperDivObserver() {
    var targetNodes = $("div.active>div.window");
    if(targetNodes.length == 1) {
        new MutationObserver(onWrapperDivMutation)
            .observe(targetNodes[0], { childList: true, subtree: true });
        console.log("Version Ninja is now observing taskboard changes...");
    } else { 
        console.log("Version Ninja expected 1 target but found " + targetNodes.length);
    }
}

function onWrapperDivMutation(mutationsList, observer) {
    for(const mutation of mutationsList) {
        if (mutation.type === "childList"
            && mutation.addedNodes.length == 1 
            && $(mutation.addedNodes[0]).hasClass("TaskBoard")
        ) {
                console.log("Version Ninja noticed taskboard change!");
                chrome.storage.onChanged.addListener(detectStorageChange);
                detectStorageChange();
        }
    }
}

addWrapperDivObserver();
