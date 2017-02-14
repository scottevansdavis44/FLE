function eh(e, func) {
    log(new Error().stack);
    var txt = 'There was an error on this page.<br /><br />';
    if (dojo.isIE) {
        txt += '<b>Error description:</b> ' + e.description + '<br />';
    }
    txt += '<b>Error name:</b> ' + e.name + '<br />';
    txt += '<b>Error message:</b> ' + e.message + '<br />';
    if (dojo.isIE) {
        txt += '<b>Error number:</b> ' + e.number + '<br />';
    }
    if (dojo.isFF) {
        txt += '<b>Line number:</b> ' + e.lineNumber + '<br />';
    }
    if (dojo.isSafari) {
        txt += '<b>Line number:</b> ' + e.line + '<br />';
    }
    txt += '<b>Function:</b> ' + func + '<br /><br />';
    txt += 'Click OK to continue.';
    hideWorking();
    myAlert(txt);
}

function myAlert(msg) {
    hideWorking();
    dojo.byId('divMessage').innerHTML = msg;
    dijit.byId('dialogAlertMessage').show();
    log(msg);
}

function myInfo(msg) {
    hideWorking();
    dojo.byId('divInformation').innerHTML = msg;
    dijit.byId('dialogInformationMessage').show();
    log(msg);
}

function log(msg) {
    if (debugMode) {
        console.log(msg);
    }
}

function loge(msg) {
    console.log(msg);
}

function showWorking2() {
    dojo.byId('divWorking').style.display = 'block';
}

function hideWorking2() {
    dojo.byId('divWorking').style.display = 'none';
}

//Function for displaying Standby text
function showWorking(loadingMessage) {
    dojo.byId('divLoadingIndicator').style.display = 'block';
    dojo.byId('loadingMessage').innerHTML = loadingMessage;
    log(loadingMessage);
}

function updateWorking(loadingMessage) {
    dojo.byId('loadingMessage').innerHTML = loadingMessage;
    dojo.byId('divLoadingIndicator').style.opacity = parseFloat(dojo.byId('divLoadingIndicator').style.opacity) - 0.1;
    log(loadingMessage);
}

//Function for hiding Standby text
function hideWorking() {
    dojo.byId('divLoadingIndicator').style.display = 'none';
}


