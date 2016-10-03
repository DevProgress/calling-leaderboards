/*
    load data for dashboard
*/

var defaultOptions = {
    eventCollection: 'phonebank-leaderboard',
    timeframe: 'this_14_days',
    timezone: 'America/Los_Angeles',
    filters: []
};

// set filter from URL
var filter = {operator: 'eq'};
var queryParams = location.search.replace('?', '').split('&');
queryParams.forEach(function(param) {
    var parts = param.split();
    if (parts.length < 2 || (param[0] !== 'name' || param[0] !== 'value')) {
        return;
    }
    filter['property_'+param[0]] = param[1];
});
if (filter.property_name && filter.property_value) {
    defaultOptions.filters.push(filter);
}

// hide survey for now
for (var i = 1; i <= 6; i++) {
    $('.survey').hide();
}

Keen.ready(function() {
    $('#lastUpdated').text(moment().format('M/D/YYYY h:mm a'));
    var refresh = [];
    // run all the widgets
    var widgets = ['contactCalls', 'totalCalls', 'leaderboard', 'uniqueCallers', 'callsPerCaller'];
    widgets.forEach(function(id) {
        var options = JSON.parse(JSON.stringify(defaultOptions));
        refresh.push(keenWidgets[id](options, id));
    });
    /*
        TODO: survey widgets
        - get list of survey questions with id, question
        - for each, push refresh(defaultOptions, question, index, id)
    for (var i = 1; i <= 6; i++) {
        refresh.push(keenWidgets.survey(defaultOptions, i, 'survey'+i));
    }
    */

    // refresh every minute
    /*
    setInterval(function() {
        refresh.forEach(function(req) {
            req.refresh();
            $('#lastUpdated').text(moment().format('M/D/YYYY h:mm a'));
        });
    }, 60*1000);
    */
});
