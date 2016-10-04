console.log('keen client');

var phonebank = null;
var user = null;
var updated = new Date();

function defaultOptions() {
    var options = {
        eventCollection: 'phonebank-leaderboard',
        timeframe: 'this_14_days',
        timezone: 'America/Los_Angeles',
        filters: []
    };
    if (phonebank && phonebank.id) {
        options.filters = [
            {
                'operator': 'eq',
                'property_name': 'phonebank.id',
                'property_value': phonebank.id
            }
        ];
    }
    return options;
}

var widgets = [];

Keen.ready(function() {
    console.log('keen.ready');
    var username = user ? user.username : null;
    widgets.push(keenWidgets.leaderboard(defaultOptions(), 'leaderboard'));
    widgets.push(keenWidgets.totalCalls(defaultOptions(), 'totalCalls'));
    widgets.push(keenWidgets.myCalls(defaultOptions(), username, 'myCalls'));
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
    if (request.phonebank && request.phonebank.id && (!phonebank || request.phonebank.id !== phonebank.id)) {
        phonebank = request.phonebank;
        document.getElementById('phonebankName').innerHTML = phonebank.name || '';
        update = true;
    }
    if (request.user && request.user.username && (!user || request.username !== user.username)) {
        user = request.user.username;
        update = true;
    }
    if (update || request.update) {
        widgets.forEach(function(widget) {
            widget.refresh();
        });
    }
});
