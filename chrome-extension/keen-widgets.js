var keenWidgets = {};

keenWidgets.leaderboard = function(options, id) {
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
        .el(document.getElementById(id));

    return client.run(query, function(err, res) {
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

keenWidgets.totalCalls = function(options, id) {
    options.filters.push({
        'operator': 'eq',
        'property_name': 'action',
        'property_value': 'call'
    });
    var count = new Keen.Query('count', options);
    // TODO: does return value of client.draw have .refresh?
    return client.draw(count, document.getElementById(id), {
        chartType: 'metric',
        title: 'Total Calls',
        // TODO: darker blue
        colors: ['#49c5b1']
    });
};

keenWidgets.contactCalls = function(options, id) {
    options.filters.push({
        'operator': 'eq',
        'property_name': 'contact',
        'property_value': true
    });
    var count = new Keen.Query('count', options);
    // TODO: does return value of client.draw have .refresh?
    return client.draw(count, document.getElementById(id), {
        chartType: 'metric',
        title: 'Contact Calls',
        // TODO: darker blue
        colors: ['#49c5b1']
    });
};

keenWidgets.myCalls = function(options, username, id) {
    if (!username) {
        document.getElementById(id).innerText = '';
        return;
    }
    options.filters.push({
        'operator': 'eq',
        'property_name': 'action',
        'property_value': 'call'
    });
    options.filters.push({
        'operator': 'eq',
        'property_name': 'user.username',
        'property_value': username
    });
    var count = new Keen.Query('count', options);
    return client.draw(count, document.getElementById(id), {
        chartType: 'metric',
        title: 'My Calls',
        // TODO: darker blue
        colors: ['#49c5b1']
    });
};

keenWidgets.uniqueCallers = function(options, id) {
    options.targetProperty = 'user.username';
    options.filters.push({
        'operator': 'eq',
        'property_name': 'action',
        'property_value': 'checkin'
    });
    var count = new Keen.Query('count_unique', options);
    // TODO: does return value of client.draw have .refresh?
    return client.draw(count, document.getElementById(id), {
        chartType: 'metric',
        title: 'Callers',
        // TODO: darker blue
        colors: ['#49c5b1']
    });
};

keenWidgets.survey = function(options, index, question, id) {
    options.action = 'call';
    options.filters.push({
        'operator': 'eq',
        'property_name': 'survey.index',
        'property_value': index
    });
    options.groupBy = 'question.answer';
    // sort by survey.answerIndex
    // TODO: does return value of client.draw have .refresh?
    return client.draw(count, document.getElementById(id), {
        chartType: 'metric',
        title: question,
    });
};
