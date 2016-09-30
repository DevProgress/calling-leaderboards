console.log('votebuilder.js');

// get user info
var username = $('#action-bar-dropdown-username').text().trim();
var committee = $('#action-bar-dropdown-van-committee');

// find the script tag with van.context
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
/*
clientID    DNC
state.shortName    California
committee.shortName 16 CA Coordinated Campaign

user.firstName  jane
user.lastName   caller
*/

var skipButton = $('input[value="Skip"]')[0];
var saveButton = $('input[value="Save - Next Household"]')[0];

skipButton.addEventListener('click', function() {
    console.log('clicked skip');
}, false);

saveButton.addEventListener('click', function() {
    console.log('clicked save');
}, false);
