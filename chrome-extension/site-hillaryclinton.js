/*
    intercept the response for XHR requests; ignore all but the user profile call
    save user name and id to the DOM so that content script can get at it
    thanks to http://stackoverflow.com/questions/9515704/building-a-chrome-extension-inject-code-in-a-page-using-a-content-script/9517879
*/
var interceptXHR = '(' + function() {
    var XHR = XMLHttpRequest.prototype;
    var open = XHR.open;
    var send = XHR.send;

    XHR.open = function(method, url) {
        this._method = method;
        this._url = url;
        return open.apply(this, arguments);
    };

    XHR.send = function(postData) {
        this.addEventListener('load', function() {
            if (this._url.indexOf('/api/the-claw/profiles/') !== 0) {
                return;
            }
            var data = JSON.parse(this.responseText);
            // save to hillaryclinton.com/calls page DOM
            var user = document.createElement('span');
            user.setAttribute('id', 'leaderboardUser');
            user.setAttribute('data-id', data.profile.gwid);
            user.setAttribute('data-name', data.profile.givenName+' '+data.profile.familyName);
            user.setAttribute('data-zip', data.profile.zipCode);
            document.body.appendChild(user);
        });
        return send.apply(this, arguments);
    };
} + ')();';

var script = document.createElement('script');
script.textContent = interceptXHR;
(document.head||document.documentElement).appendChild(script);
script.remove();

/*
    create page:
    - set source to hillaryclinton/calls
    - get user and context info
*/
function HillaryClintonPage(url) {
    this.url = url;
    this.ev = { source: 'hillaryclinton/calls', phonebank: {} };
    // get user info
    var user = $('#leaderboardUser');
    this.ev.user = {
        username: $(user).attr('data-id'),
        name: $(user).attr('data-name'),
        zip: $(user).attr('zip')
    }
    // get the phonebank from localStorage
    this.ev.phonebank = {
        id: localStorage.getItem('phonebankId'),
        name: localStorage.getItem('phonebankName')
    }
}

HillaryClintonPage.prototype.log = function() {
    // TODO: write data to keen
    console.log('page: user id='+$(user).attr('data-id')+' name='+$(user).attr('data-name'));
    this.sendContext();
};


/*
select phonebank: https://www.hillaryclinton.com/calls/phonebank/
onClick a.phonebank-link
id = href="/calls/phonebank/be40fdf6-d310-400f-8fd3-7ebdf94aaa01"
name = $(link).closest('.row').find('h2').text()

call: https://www.hillaryclinton.com/calls/phonebank/cd4f3897-980c-44b4-a755-36e2a2c42eff
no contact = button.js_no-contact
contact = button.js_finish-call
*/
var page = new HillaryClintonPage(document.location.href);
page.log();
