/*
    TODO:
    want to intercept XHR request to URL like https://www.hillaryclinton.com/api/the-claw/profiles/userid_here
    but putting a breakpoint here shows that this runs after the request has already been made
*/
var interceptXHR = '(' + function() {
    // intercept XHR
    var XHR = XMLHttpRequest.prototype;
    // Remember references to original methods
    var open = XHR.open;
    var send = XHR.send;

    // Overwrite native methods
    // Collect data
    XHR.open = function(method, url) {
        this._method = method;
        this._url = url;
        console.log('XHR.open: url=', url)
        return open.apply(this, arguments);
    };

    // Implement "ajaxSuccess" functionality
    XHR.send = function(postData) {
        console.log('XHR.send post=', postData);
        this.addEventListener('load', function() {
            //console.log('XHR.send url='+this._url+' load body=', this.responseText);
            console.log('XHR.send onLoad url='+this._url);
            /* Method        */ this._method
            /* URL           */ this._url
            /* Response body */ this.responseText
            /* Request body  */ postData
        });
        return send.apply(this, arguments);
    };
} + ')();';

var script = document.createElement('script');
script.textContent = interceptXHR;
(document.head||document.documentElement).appendChild(script);
script.remove();

/*
    create votebuilder page:
    - set source to hillaryclinton/calls
    - get user and context info
*/
function HillaryClintonPage(url) {
    this.url = url;
    this.ev = { source: 'hillaryclinton/calls', phonebank: {} };

    // TODO: get user metadata
}

HillaryClintonPage.prototype.log = function() {
    // TODO: write data to keen
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
