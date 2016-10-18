/*
    create page:
    - set source to hillaryclinton/calls
    - get user and context info
*/
function HillaryClintonPage(url) {
    this.url = url;
    this.ev = { source: 'hillaryclinton/calls'};
    // get user info
    var user = $('#leaderboardUser');
    this.ev.user = {
        username: $(user).attr('data-id'),
        name: $(user).attr('data-name'),
        zip: $(user).attr('zip')
    }
};

HillaryClintonPage.prototype.sendContext = function(update) {
    var data = {
        user: this.ev.user,
        phonebank: this.ev.phonebank,
        update: update
    };
    chrome.runtime.sendMessage(data, function(response) {
        console.log('leaderboard: sent user and phonebank', data);
    });
};

HillaryClintonPage.prototype.send = function() {
    // get the phonebank from localStorage
    this.ev.phonebank = {
        id: localStorage.getItem('phonebankId'),
        name: localStorage.getItem('phonebankName')
    };
    console.log('leaderboard: sending event', this.ev);
    keen.addEvent('phonebank-leaderboard', this.ev, function() {}, false);
    this.sendContext(true);
};

HillaryClintonPage.prototype.log = function() {
    this.sendContext();
    var match = (new RegExp('.*?calls/phonebank/(.*)')).exec(this.url);
    if (!match) {  // not phonebank select or call page
        return;
    }
    return match[1].length ? this.call() : this.checkin();
};

/*
    select phonebank: https://www.hillaryclinton.com/calls/phonebank/
*/
HillaryClintonPage.prototype.checkin = function() {
    this.ev.action = 'checkin';
    var self = this;
    // phonebank loads after page
    console.log('checkin');
    var loaded = setInterval(function() {
        if (!$('a.phonebank-link').length) {
            return;
        }
        clearInterval(loaded);
        $('a.phonebank-link').on('click', function() {
            var id = $(this).attr('href').replace('/calls/phonebank/', '');
            var name = $(this).closest('.row').find('h2').text();
            // save phonebank to localStorage
            localStorage.setItem('phonebankId', id);
            localStorage.setItem('phonebankName', name);
            // send checkin
            self.send();
            // call page loads in place
            self.call();
        });
    }, 500);
};

HillaryClintonPage.prototype.callNoContact = function() {
    console.log('call: click could not reach');
    this.ev.contact = false;
    this.send();
    $('button.js_finish-call').off('click.leaderboard');
    // new finish button added to the DOM
    // need to click finish to go to next call
    // but don't send a call with contact event
    var loaded = setInterval(function() {
        var finishButton = $('button.js_finish-call');
        if (finishButton.length < 2) {
            // not ready yet; try again
            return;
        }
        if (loaded) {
            clearInterval(loaded);
        }
        finishButton.one('click.leaderboard', function() {
            console.log('clicked finish after no contact');
            this.call();
        }.bind(this));
    }.bind(this), 500);
};

HillaryClintonPage.prototype.callWithContact = function() {
    console.log('call: click finish');
    this.ev.contact = true;
    this.send();
    this.call();
};

/*
    new call:
    - remove click listeners
    - wait for buttons
    - add click listeners
*/
HillaryClintonPage.prototype.call = function() {
    console.log('newCall');
    this.ev.action = 'call';
    // wait for buttons to load
    var loaded = setInterval(function() {
        var noContactButton = $('button.js_no-contact');
        var finishButton = $('button.js_finish-call');
        if (!noContactButton.length || !finishButton.length) {
            // not ready yet; try again
            return;
        }
        if (loaded) {
            clearInterval(loaded);
        }
        console.log('call: found buttons');
        var click = 'click.leaderboard';
        noContactButton.off(click).on(click, this.callNoContact.bind(this));
        finishButton.off(click).on(click, this.callWithContact.bind(this));
    }.bind(this), 500);
};

var page = new HillaryClintonPage(document.location.href);
page.log();
