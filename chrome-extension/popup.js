window.onload = function() {
    var doc = chrome.extension.getBackgroundPage().document;
    // copy Keen styles
    var style = doc.getElementById('keen-widgets');
    document.getElementById('keen-widgets').innerHTML = style.innerHTML || '';
    // copy content from background page to popup
    ['totalCalls', 'myCalls', 'leaderboard'].forEach(function(id) {
        var el = doc.getElementById(id);
        document.getElementById(id).innerHTML = el.innerHTML || '';
    });
    var phonebankName = doc.getElementById('phonebankName').innerHTML;
    if (phonebankName) {
        $('#dashboardLink').attr('href', 'http://devprogress.us/calling-leaderboards/dashboard.html?name=phonebank.name&value='+encodeURIComponent(phonebank.name));
    } else {
        $('#dashboardLink').hide();
    }
    var total = $('#totalCount').text().trim();
    if (total === '' || total.indexOf('0') === 0) {
        $('#widgets').hide();
        $('#noResults').show();
    } else {
        $('#widgets').show();
        $('#noResults').hide();
    }
};
