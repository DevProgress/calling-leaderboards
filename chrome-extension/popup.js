window.onload = function() {
    var doc = chrome.extension.getBackgroundPage().document;
    // copy Keen styles
    var style = doc.getElementById('keen-widgets');
    document.getElementById('keen-widgets').innerHTML = style.innerHTML || '';
    // copy content from background page to popup
    ['totalCount', 'myCount', 'leaderboard'].forEach(function(id) {
        var el = doc.getElementById(id);
        document.getElementById(id).innerHTML = el.innerHTML || '';
    });
    if ($('#totalCount').text().trim().startsWith('0')) {
        $('#widgets').hide();
        $('#noResults').show();
    } else {
        $('#widgets').show();
        $('#noResults').hide();
    }
};
