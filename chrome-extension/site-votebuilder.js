var url = document.location.href;
var ev = { source: 'VoteBuilder', phonebank: {} };

// get user info
ev.user = {
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
    ev.state = ctx.state.shortName;
    ev.committee = {
        id: ctx.committee.id,
        name: ctx.committee.name
    };
}

var pages = {
    VirtualPhoneBankRun: function(ev) {
        /*
            manual dial: select phone bank
            - get phonebank id and name and save in local storage
            - send checkin event
        */
        ev.action = 'checkin';
        var re = new RegExp('VirtualPhoneBankListID=(.*)');
        var match = re.exec(url);
        if (match && match.length > 1) {
            ev.phonebank.id = match[1];
            localStorage.setItem('phonebankId', ev.phonebank.id);
        }
        ev.phonebank.name = $('.panel-heading').text().trim();
        localStorage.setItem('phonebankName', ev.phonebank.name);

        var submitButton = $('input[type="submit"]')[0];
        submitButton.addEventListener('click', function() {
            keen.addEvent('phonebank-leaderboard', ev, function() {}, false);
            console.log('send event', ev);
        });
    },
    ContactDetailScript: function(ev) {
        /*
            manual dialer: make call
            - get phonebank id and name from local storage
            - if contact: send contact event with survey details
            - if no contact: send no contact event
        */
        ev.dialer = 'manual';
        var skipButton = $('input[value="Skip"]')[0];
        skipButton.addEventListener('click', function() {
            ev.action = 'no contact';
            console.log('send event', ev);
        }, false);
        var saveButton = $('input[value="Save - Next Household"]')[0];
        saveButton.addEventListener('click', function() {
            ev.action = 'contact';
            ev.survey = getSurveyAnswers(false);
            keen.addEvent('phonebank-leaderboard', ev, function() {}, false);
            console.log('send event', ev);
        }, false);
    },
    AutoDialLoad: function() {
        /*
            predictive dialer: select phone bank
            - get phonebank id and name and save in local storage
            - send checkin event
        */
        ev.action = 'checkin';
        console.log('need phonebank info');
    },
    AutoDialDisposition: function(ev) {
        /*
            predictive dialer: make call
            - get phonebank id and name from local storage
            - if contact: send contact event with survey details
            - if no contact: send no contact event with reason
        */
        ev.dialer = 'predictive';
        var submitButton = $('input[type="submit"]')[0];
        submitButton.addEventListener('click', function() {
            var noAnswer = $('#TDResults input:checked');
            if (noAnswer.length) {
                ev.action = 'no contact';
                var answerId = $(noAnswer[0]).attr('id');
                ev.reason = $('label[for="'+answerId+'"]').text().trim();
            } else {
                ev.action = 'contact';
                ev.survey = getSurveyAnswers(true);
            }
            keen.addEvent('phonebank-leaderboard', ev, function() {}, false);
            console.log('send event', ev);
        });
    }
};

Object.keys(pages).forEach(function(page) {
    if (url.indexOf(page) >= 0) {
        ev.phonebank = getPhonebank();
        pages[page](ev);
        console.log('sent event', ev);
    }
});


function getSurveyAnswers(table) {
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
}

function getPhonebank() {
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
}
