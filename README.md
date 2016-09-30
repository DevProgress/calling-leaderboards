# Calling leaderboards

Call-tool leaderboards! For phone bankers to compete with each other.

## setup

### load local version of extension

In Chrome, go to chrome://extensions

Make sure Developer mode checkbox is checked

Click Load unpacked extensions

Select the chrome-extension directory under this one

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
