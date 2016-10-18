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
