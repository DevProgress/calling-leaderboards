var client = new Keen({
    projectId: '57ee99308db53dfda8a71523',
    readKey: 'D39C75FDF3EB483F1740FFD1FF9F91A765A7E738472AB448F8952412CF76B5D050B89691863096BEF31A0A80728174761C01C86EE1B224E9DBE94156706274328F82D7EB8ED3D4D9962C3F9801146A675FAF605E2BAE2EB2A1B9B8D7B3DC01A2'
});
console.log('keen client');

var phonebankId = null;
var username = null;

function defaultOptions() {
    var options = {
        eventCollection: 'phonebank-leaderboard',
        timeframe: 'this_14_days',
        timezone: 'America/Los_Angeles',
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


var widgets = {};
widgets.leaderboard = function() {
    var options = defaultOptions(phonebankId);
    if (!options.filters) {
        options.filters = [];
    }
    options.filters.push({
        'operator': 'eq',
        'property_name': 'action',
        'property_value': 'call'
    });
    options.groupBy = ['user.name'];
    var query = new Keen.Query('count', options);

    var table = new Keen.Dataviz()
        .chartType('table')
        .title('Calls leaderboard')
        .chartOptions({showRowNumber: true})
        .el(document.getElementById('leaderboard'));
    client.run(query, function(err, res) {
        table
            .parseRequest(this)
            .call(function() {
                // Rename the header row
                this.dataset.updateRow(0, function(value, index) {
                    return ['Name', 'Calls'][index];
                });
                this.dataset.sortRows('desc', function(row) {
                    return row[1];
                });
            })
            .render();
    });
};

widgets.totalCount = function() {
    var options = defaultOptions(phonebankId);
    options.action = 'call';
    var count = new Keen.Query('count', options);
    client.draw(count, document.getElementById('totalCount'), {
        chartType: 'metric',
        title: 'Total Calls',
        colors: ['#49c5b1']
    });
};

widgets.myCount = function() {
    if (!username) {
        document.getElementById('myCount').innerText = '';
        return;
    }
    var options = defaultOptions(phonebankId);
    options.action = 'call';
    if (!options.filters) {
        options.filters = [];
    }
    options.filters.push({
        'operator': 'eq',
        'property_name': 'user.username',
        'property_value': username
    });
    var count = new Keen.Query('count', options);
    client.draw(count, document.getElementById('myCount'), {
        chartType: 'metric',
        title: 'My Calls',
        colors: ['#49c5b1']
    });
};

Keen.ready(function() {
    console.log('keen.ready');
    widgets.leaderboard();
    widgets.totalCount();
    // no user yet
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
        widgets.leaderboard();
        widgets.totalCount();
        widgets.myCount();
    }
});
