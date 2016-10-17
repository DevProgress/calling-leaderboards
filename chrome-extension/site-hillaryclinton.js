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
    var loaded = setInterval(function() {
        if (!$('a.phonebank-link').length) {
            return;
        }
        clearInterval(loaded);
        $('a.phonebank-link').on('click', function() {
            var id = $(this).attr('href').replace('/calls/phonebank/', '');
            var name = $(this).closest('.row').find('h2').text();
            console.log('click phonebank id='+id+' name='+name);
            // save phonebank to localStorage
            localStorage.setItem('phonebankId', id);
            localStorage.setItem('phonebankName', name);
            // send checkin
            self.send();
        });
    }, 500);
};

/*
    call: https://www.hillaryclinton.com/calls/phonebank/phonebankId
*/
HillaryClintonPage.prototype.call = function() {
    this.ev.action = 'call';
    this.ev.contact = null;
    var self = this;
    // caller info loads after page
    var loaded = setInterval(function() {
        // clicked no contact; now showing survey
        if (typeof self.ev.contact !== null && $('.canvass-option').length) {
            clearInterval(loaded);
            return;
        }
        if (!$('button.js_no-contact').length || !$('button.js_finish-call').length) {
            return;
        }
        clearInterval(loaded);
        $('button.js_no-contact')[0].addEventListener('click', function() {
            self.ev.contact = false;
            self.send();
            self.call(); // re-do event handlers call when component refreshes
        });
        $('button.js_finish-call')[0].addEventListener('click', function() {
            // skip if already clicked no contact
            if (self.ev.contact === null) {
                self.ev.contact = true;
                self.send();
            }
            self.ev.contact = null;
            self.call();  // re-do event handlers when call component refreshes
        });
    }, 500);
};

var page = new HillaryClintonPage(document.location.href);
page.log();
