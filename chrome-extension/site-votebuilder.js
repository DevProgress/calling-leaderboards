var page = new VoteBuilderPage(document.location.href);
page.log();

/*
    create votebuilder page:
    - set source to VoteBuilder
    - get user and context info
*/
function VoteBuilderPage(url) {
    this.url = url;
    this.ev = { source: 'VoteBuilder', phonebank: {} };

    // get user info
    this.ev.user = {
        username: $('#action-bar-dropdown-van-name').text().trim(),
        name: $('#action-bar-dropdown-username').text().trim()
    };

    // get state and committee info from the script tag that sets up Angular
    var ctx = null;
    $('script').each(function() {
        var text = $(this).text();
        if (text.indexOf('van.context') < 0) {
            return;
        }
        var start = text.indexOf('{', text.indexOf('angular.module'));
        var end = text.lastIndexOf('}', text.lastIndexOf('}') - 1)+1;
        ctx = JSON.parse(text.substring(start, end));
    });
    if (ctx) {
        this.ev.state = ctx.state.shortName;
        this.ev.committee = {
            id: ctx.committee.id,
            name: ctx.committee.name
        };
    }
}

VoteBuilderPage.prototype.log = function() {
    this.ev.phonebank = this.phonebank();
    if (this.url.indexOf('VirtualPhoneBankRun') >= 0) {
        return this.manualCheckin();
    }
    if (this.url.indexOf('ContactDetailScript') >= 0) {
        return this.manualCall();
    }
    if (this.url.indexOf('AutoDialLoad') >= 0) {
        return this.predictiveCheckin();
    }
    if (this.url.indexOf('AutoDialDisposition') >= 0) {
        return this.predictiveCall();
    }
};

/*
    manual dial: select phone bank
    - get phonebank id and name and save in local storage
    - send checkin event
*/
VoteBuilderPage.prototype.manualCheckin = function() {
    this.ev.action = 'checkin';
    var re = new RegExp('VirtualPhoneBankListID=(.*)');
    var match = re.exec(url);
    if (match && match.length > 1) {
        this.ev.phonebank.id = match[1];
        localStorage.setItem('phonebankId', this.ev.phonebank.id);
    }
    this.ev.phonebank.name = $('.panel-heading').text().trim();
    localStorage.setItem('phonebankName', this.ev.phonebank.name);

    var submitButton = $('input[type="submit"]')[0];
    submitButton.addEventListener('click', function() {
        keen.addEvent('phonebank-leaderboard', this.ev, function() {}, false);
        console.log('send event', this.ev);
    });
};

/*
    manual dialer: make call
    - get phonebank id and name from local storage
    - if contact: send contact event with survey details
    - if no contact: send no contact event
*/
VoteBuilderPage.prototype.manualCall = function() {
    this.ev.dialer = 'manual';
    var skipButton = $('input[value="Skip"]')[0];
    skipButton.addEventListener('click', function() {
        this.ev.action = 'no contact';
        keen.addEvent('phonebank-leaderboard', this.ev, function() {}, false);
        console.log('send event', this.ev);
    }, false);
    var saveButton = $('input[value="Save - Next Household"]')[0];
    saveButton.addEventListener('click', function() {
        this.ev.action = 'contact';
        this.ev.survey = this.surveyAnswers(false);
        keen.addEvent('phonebank-leaderboard', this.ev, function() {}, false);
        console.log('send event', this.ev);
    }, false);
};

/*
    predictive dialer: select phone bank
    - get phonebank id and name and save in local storage
    - send checkin event
*/
VoteBuilderPage.prototype.predictiveCheckin = function() {
    this.ev.action = 'checkin';
    console.log('need phonebank info');
/*
https://www.votebuilder.com/AutoDialLoad.aspx?ActivateAutoDialID=EIDFDF8J

<a href="https://www.votebuilder.com/AutoDialLoad.aspx?ActivateAutoDialID=36831">CA2NV Recruit 10.1</a>
*/


};

/*
    predictive dialer: make call
    - get phonebank id and name from local storage
    - if contact: send contact event with survey details
    - if no contact: send no contact event with reason
*/
VoteBuilderPage.prototype.predictiveCall = function() {
    this.ev.dialer = 'predictive';
    var submitButton = $('input[type="submit"]')[0];
    submitButton.addEventListener('click', function() {
        var noAnswer = $('#TDResults input:checked');
        if (noAnswer.length) {
            this.ev.action = 'no contact';
            var answerId = $(noAnswer[0]).attr('id');
            this.ev.reason = $('label[for="'+answerId+'"]').text().trim();
        } else {
            this.ev.action = 'contact';
            this.ev.survey = this.surveyAnswers(true);
        }
        keen.addEvent('phonebank-leaderboard', this.ev, function() {}, false);
        console.log('send event', this.ev);
    });
};

VoteBuilderPage.prototype.surveyAnswers = function(table)  {
    var survey = {};
    $('select').each(function() {
        var val = $(this).val();
        if (!val || val === '0') {
            return;
        }
        var question;
        if (table) {
            question = $(this).closest('tr').find('td:eq(0)').text().trim();
        } else {
            question = $(this).parent().parent().find('label').text().trim();
        }
        var answer = $(this).find('option[value="'+val+'"]').text().trim();
        if (answer) {
            survey[question] = answer;
        }
    });
    return survey;
};

VoteBuilderPage.prototype.phonebank = function() {
    var pb = {};
    var id = localStorage.getItem('phonebankId');
    if (id) {
        pb.id = id;
    }
    var name =localStorage.getItem('phonebankName');
    if (name) {
        pb.name = name;
    }
    return pb;
};

