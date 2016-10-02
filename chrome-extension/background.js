console.log('keen client');

var phonebankId = null;
var username = null;
var updated = new Date();

function defaultOptions() {
    var options = {
        eventCollection: 'phonebank-leaderboard',
        timeframe: 'this_14_days',
        timezone: 'America/Los_Angeles',
        filters: []
    };
    if (phonebankId) {
        options.filters = [
            {
                'operator': 'eq',
                'property_name': 'phonebank.id',
                'property_value': phonebankId
            }
        ];
    }
    return options;
}

var widgets = [];

Keen.ready(function() {
    console.log('keen.ready');
    var options = defaultOptions();
    widgets.push(keenWidgets.leaderboard(options, 'leaderboard'));
    widgets.push(keenWidgets.totalCalls(options, 'totalCount'));
    widgets.push(keenWidgets.myCount(options, username, 'myCount'));
    updated = new Date();
    // refresh at least every 5 minutes
    setInterval(function() {
        var now = new Date();
        if ((now.getTime() - updated.getTime()) > 5*60*1000) {
            widgets.forEach(function(widget) {
                widget.refresh();
            });
        }
    }, 5*60*1000);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('got message ', request);
    var update = false;
    if (request.phonebank && request.phonebank.id && request.phonebank.id !== phonebankId) {
        phonebankId = request.phonebank.id;
        update = true;
    }
    if (request.user && request.user.username && request.username !== username) {
        username = request.user.username;
        update = true;
    }
    if (update || request.update) {
        widgets.forEach(function(widget) {
            widget.refresh();
        });
    }
});
