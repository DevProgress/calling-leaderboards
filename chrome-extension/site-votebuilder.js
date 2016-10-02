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
    this.sendContext();
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
    this.phonebankMapping();
};

VoteBuilderPage.prototype.sendContext = function(update) {
    if (this.ev.phonebank) {
        var data = {
            user: this.ev.user,
            phonebank: this.ev.phonebank
        };
        if (update) {
            data.update = true;
        }
        chrome.runtime.sendMessage(data, function(response) {
            console.log('leaderboard: sent user and phonebank', data);
        });
    }
};

VoteBuilderPage.prototype.send = function() {
    console.log('leaderboard: sending event', this.ev);
    keen.addEvent('phonebank-leaderboard', this.ev, function() {}, false);
    this.sendContext(true);
};

/*
    get phonebank id from query param: ActivateAutoDialID=36831
*/
VoteBuilderPage.prototype.autoDialId = function(url) {
    var re = new RegExp('ActivateAutoDialID=(.*)');
    var match = re.exec(url);
    return (match && match.length > 1) ? match[1] : null;
};

/*
    predictive auto dialer start page has the phonebank id, but not name
    look for links to AutoDialLoad
    save id-name mapping in localstorage
*/
VoteBuilderPage.prototype.phonebankMapping = function() {
    // <a href="https://www.votebuilder.com/AutoDialLoad.aspx?ActivateAutoDialID=36831">CA2NV Recruit 10.1</a>
    var self = this;
    $('a').each(function() {
        var href = $(this).attr('href');
        if (!href || href.indexOf('AutoDialLoad') < 0) {
            return;
        }
        // get id from URL
        var id = self.autoDialId(href);
        var text = $(this).text().trim();
        if (id && text) {
            localStorage.setItem('pb'+id, text);
        }
    });
};

/*
    manual dial: select phone bank
    - get phonebank id and name and save in local storage
    - send checkin event
*/
VoteBuilderPage.prototype.manualCheckin = function() {
    this.ev.action = 'checkin';
    var re = new RegExp('VirtualPhoneBankListID=(.*)');
    var match = re.exec(this.url);
    if (match && match.length > 1) {
        this.ev.phonebank.id = match[1];
        localStorage.setItem('phonebankId', this.ev.phonebank.id);
    }
    this.ev.phonebank.name = $('.panel-heading').text().trim();
    localStorage.setItem('phonebankName', this.ev.phonebank.name);

    var submitButton = $('input[type="submit"]')[0];
    submitButton.addEventListener('click', function() {
        this.send();
    }.bind(this));
};

/*
    manual dialer: make call
    - get phonebank id and name from local storage
    - if contact: send contact event with survey details
    - if no contact: send no contact event
*/
VoteBuilderPage.prototype.manualCall = function() {
    this.ev.dialer = 'manual';
    this.ev.action = 'call';
    var skipButton = $('input[value="Skip"]')[0];
    skipButton.addEventListener('click', function() {
        this.ev.contact = false;
        this.send();
    }.bind(this), false);
    var saveButton = $('input[value="Save - Next Household"]')[0];
    saveButton.addEventListener('click', function() {
        this.ev.contact = true;
        this.ev.survey = this.surveyAnswers(false);
        this.send();
    }.bind(this), false);
};

/*
    predictive dialer: select phone bank
    - get phonebank id and name and save in local storage
    - send checkin event
*/
VoteBuilderPage.prototype.predictiveCheckin = function() {
    this.ev.action = 'checkin';
    var id = this.autoDialId(this.url);
    this.ev.phonebank = { id: id };
    if (id) {
        this.ev.phonebank.name = localStorage.getItem('pb'+id);
        localStorage.setItem('phonebankId', this.ev.phonebank.id);
        localStorage.setItem('phonebankName', this.ev.phonebank.name);
    }
    var submitButton = $('input[type="submit"]')[0];
    submitButton.addEventListener('click', function() {
        this.send();
    }.bind(this));
};

/*
    predictive dialer: make call
    - get phonebank id and name from local storage
    - if contact: send contact event with survey details
    - if no contact: send no contact event with reason
*/
VoteBuilderPage.prototype.predictiveCall = function() {
    this.ev.dialer = 'predictive';
    this.ev.action = 'call';
    var submitButton = $('input[type="submit"]')[0];
    submitButton.addEventListener('click', function() {
        var noAnswer = $('#TDResults input:checked');
        if (noAnswer.length) {
            this.ev.contact = false;
            var answerId = $(noAnswer[0]).attr('id');
            this.ev.reason = $('label[for="'+answerId+'"]').text().trim();
        } else {
            this.ev.contact = true;
            this.ev.survey = this.surveyAnswers(true);
        }
        this.send();
    }.bind(this));
};

VoteBuilderPage.prototype.surveyAnswers = function(table)  {
    var survey = {};
    var question = 1;
    $('select').each(function() {
        var val = $(this).val();
        survey.index = question;
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
        // get answer index within select
        var answerIndex = 0;
        var a = 1;
        var found = false;
        $(this).find('option').each(function() {
            if ($(this).attr('value') === answer) {
                answerIndex = a;
            }
            a += 1;
        });
        if (answer) {
            survey.question = question;
            survey.answer = answer;
            survey.answerIndex = answerIndex;
        }
        question += 1;
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

var page = new VoteBuilderPage(document.location.href);
page.log();
