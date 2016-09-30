var url = document.location.href;

// get user info
var user = $('#action-bar-dropdown-van-name').text().trim();
var name = $('#action-bar-dropdown-username').text().trim();

var ev = {
    source: 'VoteBuilder',
    user: {
        username: user,
        name: name
    },
    phonebank: {}
};

// get context info from the script tag that sets up Angular
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
console.log('ctx=', ctx);

if (ctx) {
    ev.state = ctx.state.shortName;
    ev.committee = {
        id: ctx.committee.id,
        name: ctx.committee.name
    };
}

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

// save phonebank details to local storage and send checkin event on submit
if (url.indexOf('VirtualPhoneBankRun') >= 0) {
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
        console.log('send event', ev);
        // keen.recordEvent('phonebank-leaderboard', ev);
    });
}

// predictive dialer
if (url.indexOf('AutoDialDisposition') >= 0) {
    var submitButton = $('input[type="submit"]')[0];
    ev.dialer = 'predictive';
    ev.phonebank = getPhonebank();
    submitButton.addEventListener('click', function() {
        var noAnswer = $('#TDResults input:checked');
        if (noAnswer.length) {
            ev.action = 'no contact';
            var answerId = $(noAnswer[0]).attr('id');
            var label = $('label[for="'+answerId+'"]').text().trim();
        } else {
            ev.action = 'contact';
            ev.survey = getSurveyAnswers(true);
        }
        console.log('send event', ev);
        // keen.recordEvent('phonebank-leaderboard', ev);
    });
}

// manual dialer
if (url.indexOf('ContactDetailScript') >= 0) {
    ev.dialer = 'manual';
    ev.phonebank = getPhonebank();
    var skipButton = $('input[value="Skip"]')[0];
    var saveButton = $('input[value="Save - Next Household"]')[0];

    skipButton.addEventListener('click', function() {
        ev.action = 'no contact';
        console.log('send event', ev);
    }, false);

    saveButton.addEventListener('click', function() {
        ev.action = 'contact';
        ev.survey = getSurveyAnswers(false);
        console.log('send event', ev);
        // keen.recordEvent('phonebank-leaderboard', ev);
    }, false);
}

