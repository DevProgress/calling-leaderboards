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
        .chartOptions({showRowNumber: true, width: '100%'})
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
        $('#leaderboard thead th:first').text('#');
    });
};

keenWidgets.totalCalls = function(options, id) {
    options.filters.push({
        'operator': 'eq',
        'property_name': 'action',
        'property_value': 'call'
    });
    var query = new Keen.Query('count', options);
    var metric = new Keen.Dataviz()
        .el(document.getElementById(id))
        .prepare();
    return client.run(query, function() {
        metric
            .parseRequest(this)
            .title('Total calls')
            .render();
    });
};

keenWidgets.contactCalls = function(options, id) {
    options.filters.push({
        'operator': 'eq',
        'property_name': 'contact',
        'property_value': true
    });
    var query = new Keen.Query('count', options);
    var metric = new Keen.Dataviz()
        .el(document.getElementById(id))
        .prepare();
    return client.run(query, function() {
        metric
            .parseRequest(this)
            .title('Calls with contact')
            .render();
    });
};

keenWidgets.myCalls = function(options, username, id) {
    if (!username) {
        username = 'placeholder_username_'+(new Date()).getTime();
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
    var query = new Keen.Query('count', options);
    var metric = new Keen.Dataviz()
        .el(document.getElementById(id))
        .prepare();
    return client.run(query, function() {
        metric
            .parseRequest(this)
            .title('My calls')
            .render();
    });
};

keenWidgets.uniqueCallers = function(options, id) {
    options.targetProperty = 'user.username';
    options.filters.push({
        'operator': 'eq',
        'property_name': 'action',
        'property_value': 'call'
    });
    var query = new Keen.Query('count_unique', options);
    var metric = new Keen.Dataviz()
        .el(document.getElementById(id))
        .prepare();
    return client.run(query, function() {
        metric
            .parseRequest(this)
            .title('Callers')
            .render();
    });
};

keenWidgets.callsPerCaller = function(options, id) {
    options.filters.push({
        'operator': 'eq',
        'property_name': 'action',
        'property_value': 'call'
    });
    options.analyses = {
        'calls': {
            'analysis_type': 'count'
        },
        'callers': {
            'analysis_type': 'count_unique',
            'target_property': 'user.username'
        }
    };
    var query = new Keen.Query('multi_analysis', options);
    var metric = new Keen.Dataviz()
        .el(document.getElementById(id))
        .prepare();
    return client.run(query, function() {
        // {callers: 1, calls: 2}
        var result = this.data.result;
        var avg = 0;
        if (result && result.callers && result.calls) {
            avg = Math.round((result.calls/result.callers)*10)/10;
        }
        metric
            .parseRawData({ result: avg })
            .title('Calls per caller')
            .render();
    });
};

keenWidgets.survey = function(options, index, question, id) {
    options.filters.push({
        'operator': 'eq',
        'property_name': 'survey.index',
        'property_value': index
    });
    options.groupBy = 'question.answer';
    // sort by survey.answerIndex
    var query = new Keen.Query('count', options);
    // TODO:
};

keenWidgets.vsOtherPhonebanks = function(options, id) {
    // replace filters; don't want a single phonebank
    options.filters = [
        {
            'operator': 'eq',
            'property_name': 'action',
            'property_value': 'call'
        }
    ];
    options.groupBy = ['phonebank.name'];
    var query = new Keen.Query('count', options);
    var chart = new Keen.Dataviz()
        .chartType('barchart')
        .colors(['#0D98E6'])
        .el(document.getElementById(id))
        .chartOptions({
            legend: { position: 'none' },
            vAxis: {
                format: 'short', textPosition: 'in', textStyle: { color: 'white' } },
        })
        .prepare();
    return client.run(query, function() {
        chart
            .parseRequest(this)
            .title('')
            .render();
    });
};
