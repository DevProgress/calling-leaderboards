# Calling leaderboards

Call-tool leaderboards! For phone bankers to compete with each other.

## how it works

[chrome-extension/manifest.json](manifest.json) defines the Chrome extension.  On URLs matching `https://www.votebuilder.com/*`:

### content script

Load Keen SDK, jQuery, and Keen API key (dependencies) and [chrome-extension/site-votebuilder.js](site-votebuilder.js).  This script:
- get username and full name from current Votebuilder page
- extract committee and state from a Votebuilder script tag
- look for links to an `AutoDialLoad` page (example: `<a href="https://www.votebuilder.com/AutoDialLoad.aspx?ActivateAutoDialID=36831">CA2NV Recruit 10.1</a>`).  Extract the phonebank id from the URL query param and the name from the link, and save in localStorage
- send a message using `chrome.runtime.sendMessage` containing the user, phonebank, and comittee info (who is this user, and which phonebank are they using)

Four pages send an event to Keen.io containing the dialer type, username, full name, phonebank, com,ittee, state, and action.

#### Manual dialer

On `VirtualPhoneBankRun`, get phoneank id and name from the DOM, and send an event with `action: checkin` when user clicks the _Next_ button

On `ContactDetailScript`, send an event with `action call`.  Add a `contact` param:
- click _Skip_: send `contact: false`
- click _Save - Next Household_: send `contact: true`

#### Predictive dialer

On `AutoDialLoad`, get phonebank id from the URL and the name from localStorage. Send an event with `action: checkin` when user clicks the _Next_ button

On `AutoDialDisposition`, send an event with `action call`.  Add a `contact` param:
- if reason selected: send `contact: false` and `reason: selected_reason`
- send `contact: true`

#### survey

Both the manual and predictive dialers have surveys.  On both pages, extract get selected values from survey, and send with event:

    survey: {
        index: "3"
        question: "What's the answer?",
        answer: "42",
        answerIndex: 3
    }

Results for first six survey questions are viewable on [dashboard.html](dashboard.html)


### background page

In an invisible background tab, load [chrome-extension/background.html](background.html).  This page:

Loads data from Keen, draws metric counts and the leaderboard table, and writes the phonebank name.  It can take a few seconds to fully load the data.  This page loads it in the background, so that it's available immediately when the user clicks the extension button.

Listens for the messages sent by the extension when a user does something (call or checkin), and refreshes the data if needed.

Refreshes the data if it's been 5 minutes since the last update.

### popup

When the user clicks the extension's button, load [chrome-extension/popup.html](popup.html) into the extension window.  This page copies the metrics and leaderboard content from the background page's DOM, and displays a link to the full dashboard.

## setup

### load local version of extension

In Chrome, go to chrome://extensions

Make sure Developer mode checkbox is checked

Click Load unpacked extensions

Select the chrome-extension directory under this one

Optional but useful: install [https://chrome.google.com/webstore/detail/keen-debugger/jaanimjmcilehhddhdalaplgkebjbmfj?hl=en](Keen Debugger extension)

### developer setup

    cd chrome-extension
    bower install

### pages

Get static copies of pages from #proj-leader-board---t and unzip into `pages` directory

Run `python -m SimpleHTTPServer`

Load local static files:

    http://localhost:8000/call.html
    http://localhost:8000/phone_bank_select.html

## notes

full name `#action-bar-dropdown-username`
username `#action-bar-dropdown-van-name`
committee name `#action-bar-dropdown-van-committee`

    angular.module('van.context', []).value('contextValueService', {"clientID":"DNC","culture":{"currentCulture":"","defaultCulture":"","defaultSystemCulture":"en-US"},"state":{"id":"DNCCA","clientID":"DNC","name":"VoteBuilder California","shortName":"California"},"committee":{"id":"EID449DN","name":"2016 California Coordinated Campaign","shortName":"16 CA Coordinated Campaign"},"user":{"id":1252386,"firstName":"jane","lastName":"caller","email":"caller@test.com","isUsingNewSupportRequests":false},"currentTabName":"My Campaign","linkedTabName":"My Voters","dateFormat":"M/d/yyyy","jQueryDateFormat":"m/d/yy","pageSpecificContext":{},"dateTimeFormat":"M/d/yyyy h:mm a","timeZoneOffset":-420});

clientID    DNC
state.shortName    California
committee.shortName 16 CA Coordinated Campaign

user.firstName  jane
user.lastName   caller


### phone bank select

https://www.votebuilder.com/MyListVirtualPhoneBank.aspx

selected = `$('input[name="ctl00$ContentPlaceHolderVANPage$WizardControl$VanDetailsItemVPBList$VANInputItemDetailsItemVPBList$VPBList"]').val()`

submit = `input[type="submit"]` or `#ctl00_ContentPlaceHolderVANPage_WizardControl_StartNavigationTemplateContainerID_ButtonStartNext`

### call

https://www.votebuilder.com/ContactDetailScript.aspx?FromSortPage=1&CurrentVirtualPhoneBank=1

made contact `#switch`

if yes: `$('#result-list').length` == 0
if no: `$('#result-list').length` > 0
Skip button `input[value="Skip"]`
Save `input[value="Save - Next Household"]`
