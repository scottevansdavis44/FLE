function toggleTool(evt) {
    dojo.forEach(dojo.query('.btnTools'), function (input) {
        var nm = input.attributes[2].value;
        dijit.byId(nm).set('checked', (nm === evt.id));
    });
}

function closeLeftPane() {
    var mypanes = ["AVLPanePage", "CFSPanePage", "AVLCFSPanePage", "CFSDetailPanePage", "TOCPanePage", "FEEDPanePage"];
    dojo.forEach(mypanes, function (itm) {
        if (dojo.hasClass(itm, "myshowPane")) { dojo.byId(itm).className = 'myhidePane'; }
    });
    dojo.byId('imgCloseLeftPane').style.visibility = 'hidden';
    dojo.replaceClass("informationPane", "slideclose", "slideopen");
    dojo.forEach(dojo.query('.btnTools'), function (input) {
        var nm = input.attributes[2].value;
        if (dijit.byId(nm).get('checked')) { dijit.byId(nm).set('checked', false); }
    });
}

function toggleAVLCall(elm) {
    var mypanes = ["AVLPanePage", "CFSPanePage", "AVLCFSPanePage", "CFSDetailPanePage", "TOCPanePage", "FEEDPanePage"];
    var openpane = dojo.filter(mypanes, function (itm) {
        return (dojo.hasClass(itm, "myshowPane"))
    });
    if (openpane.length === 1) {
        if (openpane[0] !== elm) {
            dojo.byId(openpane[0]).className = "myhidePane";
            dojo.byId(elm).className = "myshowPane";
            dijit.byId(elm).resize({ w: 486 });
        }
    } else {
        dojo.replaceClass("informationPane", "slideopen", "slideclose");
        dojo.byId('imgCloseLeftPane').style.visibility = 'visible';
        dojo.byId(elm).className = "myshowPane";
        dijit.byId(elm).resize({ w: 486 });
    }
    cfsStatusFilter = null;
    //if (elm != 'CFSDetailPanePage') { map.getLayer('glhilite').clear(); }
}

function hidePopups(elm) {
    if (elm !== "divTOC") { dojo.replaceClass("divTOC", "hidden", "visible"); }
    if (elm !== "divGallery") { dojo.replaceClass("divGallery", "hidden", "visible"); }
    if (elm !== "divFeeds") { dojo.replaceClass("divFeeds", "hidden", "visible"); }
    dojo.replaceClass("divLegend", "hidden", "visible");
}

function closeMapDivs(elm) {
    if (dojo.hasClass(elm, "visible")) {
        dojo.replaceClass(elm, "hidden", "visible");
    }
}

function RemoveChildren(parentNode) {
    if (parentNode) {
        while (parentNode.hasChildNodes()) {
            parentNode.removeChild(parentNode.lastChild);
        }
    }
}

function blur() {
    require(["dijit/focus"], function (focusUtil) {
        focusUtil.curNode && focusUtil.curNode.blur();
    });
}

function sortByKeys(array, key, key2, order, order2) {
    return array.sort(function (a, b) {
        var xx = a[key].toLowerCase(), yy = b[key].toLowerCase();
        if (xx === yy) {
            var x = a[key2].toLowerCase(), y = b[key2].toLowerCase();
            if (order2 == 'A') {
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            } else {
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            }
        }
        if (order == 'A') {
            return ((xx < yy) ? -1 : ((xx > yy) ? 1 : 0));
        } else {
            return ((xx > yy) ? -1 : ((xx < yy) ? 1 : 0));
        }
    });
}

function sortByKey(array, key, order) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        if (typeof x == "string") {
            x = x.toLowerCase();
            y = y.toLowerCase();
        }
        if (order == 'A') {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        } else {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
}

function formatDirection(value) {
    return parseInt(value);
}

function formatDate(value) {
    if (value == null || value == 'null' || value == '') {
        return '';
    } else {
        return dojo.date.locale.format(new Date(value), {
            selector: 'date',
            datePattern: 'yyyy-MM-dd HH:mm:ss'
        });
    }
}

function formatTime(value) {
    if (value == null || value == 'null' || value == '') {
        return '';
    } else {
        return dojo.date.locale.format(new Date(value), {
            selector: 'date',
            datePattern: 'HH:mm:ss'
        });
    }
}

function daysBetween(date1, date2) {
    //Get 1 day in milliseconds
    var one_day = 1000 * 60 * 60 * 24;

    if (!date1 || !date2) {
        return '';
    }

    // Convert both dates to milliseconds
    var date1_ms = new Date(date1).getTime();
    var date2_ms = new Date(date2).getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;
    //take out milliseconds
    difference_ms = difference_ms / 1000;
    var seconds = Math.floor(difference_ms % 60);
    //var minutes = seconds / 60;

    difference_ms = difference_ms / 60;
    var minutes = Math.floor(difference_ms % 60);
    //difference_ms = difference_ms / 60;
    //var hours = Math.floor(difference_ms % 24);
    //var days = Math.floor(difference_ms / 24);

    m = (minutes < 10) ? '0' + minutes : minutes;
    s = (seconds < 10) ? '0' + seconds : seconds;
    return '' + m + ' m ' + s + ' s';

}

var mydragg = function () {
    return {
        move: function (divid, xpos, ypos) {
            divid.style.left = xpos + 'px';
            divid.style.top = ypos + 'px';
        },
        startMoving: function (divid, container, evt) {
            evt = evt || window.event;
            var posX = evt.clientX,
                posY = evt.clientY,
            divTop = divid.style.top,
            divLeft = divid.style.left,
            eWi = parseInt(divid.style.width),
            eHe = parseInt(divid.style.height),
            //cWi = parseInt(document.getElementById(container).style.width),
            //cHe = parseInt(document.getElementById(container).style.height);
            cWi = map.width,
            cHe = map.height;
            document.getElementById(container).style.cursor = 'move';
            divTop = divTop.replace('px', '');
            divLeft = divLeft.replace('px', '');
            var diffX = posX - divLeft,
                diffY = posY - divTop;
            document.onmousemove = function (evt) {
                evt = evt || window.event;
                var posX = evt.clientX,
                    posY = evt.clientY,
                    aX = posX - diffX,
                    aY = posY - diffY;
                if (aX < 0) aX = 0;
                if (aY < 0) aY = 0;
                if (aX + eWi > cWi) aX = cWi - eWi;
                if (aY + eHe > cHe) aY = cHe - eHe;
                mydragg.move(divid, aX, aY);
            }
        },
        stopMoving: function (divid, container) {
            var cWi = map.width, cHe = map.height, divTop = divid.style.top, divLeft = divid.style.left, eWi = parseInt(divid.style.width), eHe = parseInt(divid.style.height);
            divTop = divTop.replace('px', '');
            divLeft = divLeft.replace('px', '');
            gridWidthTimes = Math.floor(cWi / eWi);
            gridHeightTimes = Math.floor(cHe / eHe);
            gridWidth = Math.floor(cWi / gridWidthTimes);
            gridHeight = Math.floor(cHe / gridHeightTimes);
            newX = Math.floor(divLeft / gridWidth) * gridWidth;
            newY = Math.floor(divTop / gridHeight) * gridHeight;
            divid.style.left = newX + 'px';
            divid.style.top = newY + 'px';
            document.getElementById(container).style.cursor = 'default';
            dojo.cookie(divid.id, dojo.toJson(divid.style.left + '|' + divid.style.top + '|max'), {
                expires: 365
            });
            blur();
            document.onmousemove = function () { }
        },
        onmapresize: function (w, h) {
            dojo.forEach(['floater_P1', 'floater_P2', 'floater_P3', 'floater_P4'], function (id) {
                if (document.getElementById(id).style.display === 'block') {
                    var docheight = parseFloat(document.getElementById(id).style.height, 10);
                    var py = parseFloat(document.getElementById(id).style.top, 10);
                    if (py + docheight > h) { document.getElementById(id).style.top = (h - docheight) + 'px'; }
                    var docwidth = parseFloat(document.getElementById(id).style.width, 10);
                    var px = parseFloat(document.getElementById(id).style.left, 10);
                    if (px + docwidth > w) { document.getElementById(id).style.left = (w - docwidth) + 'px'; }
                }
            });
        },
        onshow: function () {
            dojo.forEach(['floater_P1', 'floater_P2', 'floater_P3', 'floater_P4'], function (id) {
                var data = dojo.cookie(id);
                if (data) {
                    p1 = dojo.fromJson(data).split('|');
                    var docheight = parseFloat(document.getElementById(id).style.height, 10);
                    var py = parseFloat(p1[1], 10);
                    document.getElementById(id).style.top = (py + docheight > map.height) ? (map.height - docheight) + 'px' : p1[1];
                    var docwidth = parseFloat(document.getElementById(id).style.width, 10);
                    var px = parseFloat(p1[0], 10);
                    document.getElementById(id).style.left = (px + docwidth > map.width) ? (map.width - docwidth) + 'px' : p1[0];
                }
            });
        },
        min: function (divid) {
            dojo.cookie(document.getElementById(divid).id, dojo.toJson(document.getElementById(divid).style.left + '|' + document.getElementById(divid).style.top + '|min'), {
                expires: 365
            });
            document.getElementById(divid).style.display = 'none';
        },
        max: function (divid) {
            if (document.getElementById(divid).style.display === 'block') {
                mydragg.min(divid);
                return;
            }
            var data = dojo.cookie(divid);
            if (data) {
                p1 = dojo.fromJson(data).split('|');
                var docheight = parseFloat(document.getElementById(divid).style.height, 10);
                var py = parseFloat(p1[1], 10);
                document.getElementById(divid).style.top = (py + docheight > map.height) ? (map.height - docheight) + 'px' : p1[1];
                var docwidth = parseFloat(document.getElementById(divid).style.width, 10);
                var px = parseFloat(p1[0], 10);
                document.getElementById(divid).style.left = (px + docwidth > map.width) ? (map.width - docwidth) + 'px' : p1[0];
            }
            document.getElementById(divid).style.display = 'block';
            dojo.cookie(divid, dojo.toJson(document.getElementById(divid).style.left + '|' + document.getElementById(divid).style.top + '|max'), {
                expires: 365
            });
        },
        onload: function () {
            dojo.forEach(['floater_P1', 'floater_P2', 'floater_P3', 'floater_P4'], function (id) {
                var data = dojo.cookie(id);
                if (data) {
                    p1 = dojo.fromJson(data).split('|');
                    var docheight = parseFloat(document.getElementById(id).style.height, 10);
                    var py = parseFloat(p1[1], 10);
                    document.getElementById(id).style.top = (py + docheight > map.height) ? (map.height - docheight) + 'px' : p1[1];
                    var docwidth = parseFloat(document.getElementById(id).style.width, 10);
                    var px = parseFloat(p1[0], 10);
                    document.getElementById(id).style.left = (px + docwidth > map.width) ? (map.width - docwidth) + 'px' : document.getElementById(id).style.left = p1[0];
                    if (p1[2] === 'min') {
                        document.getElementById(id).style.display = 'none';
                    } else {
                        document.getElementById(id).style.display = 'block';
                        dojo.cookie(id, dojo.toJson(document.getElementById(id).style.left + '|' + document.getElementById(id).style.top + '|max'), {
                            expires: 365
                        });
                    }
                } else {
                    dojo.cookie(id, dojo.toJson(document.getElementById(id).style.left + '|' + document.getElementById(id).style.top + '|max'), {
                        expires: 365
                    });
                }
            });
        }
    }
}();

