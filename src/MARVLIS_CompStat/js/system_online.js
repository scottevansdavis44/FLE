function signIn() {
    var signInLink = dojo.byId('signIn');
    if (signInLink.innerHTML.indexOf('In') !== -1) {
        portal.signIn().then(function (loggedInUser) {
            signInLink.innerHTML = "Sign Out";
            findArcGISGroup();
        }, function (error) {
            signInLink.innerHTML = 'Sign In';
        });
    } else {
        portal.signOut().then(function (portalInfo) {
            signInLink.innerHTML = "Sign In";
            findArcGISGroup();
            if (groupGrid) {
                groupGrid.refresh();
            }
        });
    }
}

// find groups based on input keyword
function findArcGISGroup() {
    if (dojo.byId('signIn').innerHTML.indexOf('Out') !== -1) {
        var keyword = dijit.byId('groupFinder').get('value');
        var params = {
            q: keyword,
            sortField: 'modified',
            sortOrder: 'desc',
            num: 20  //find 20 items - max is 100
        };
        portal.queryGroups(params).then(function (data) {
            showGroupResults(data);
        });
    } else {
        myInfo('Please sign in using an ArcGIS Online account.');
    }
}

//display a list of groups that match the input user name
function showGroupResults(response) {
    require(["dgrid/Grid"], function (Grid) {
        //clear any existing results
        var data = [];
        if (groupGrid) {
            groupGrid.refresh();
        }
        if (response.total > 0) {
            //create an array of attributes for each group - we'll display these in a dojo dgrid
            data = dojo.map(response.results, function (group) {
                return {
                    'snippet': group.snippet,
                    'title': group.title,
                    'url': group.url,
                    'thumbnail': group.thumbnailUrl || '',
                    'id': group.id,
                    'owner': group.owner
                };
            });
            //create the grid
            groupGrid = new Grid({
                columns: {
                    thumbnail: 'Group Icon',
                    title: 'Group',
                    snippet: 'Description'
                },
                renderRow: renderTable,
                //this function renders the table in a non-grid looking view
                showHeader: false
            }, "grid");
            groupGrid.renderArray(data);
            dojo.byId('groupResults').innerHTML = '';
        } else {
            dojo.byId('groupResults').innerHTML = '<h2>Group Results</h2><p>No groups were found. If the group is not public use the sign-in link to sign in and find private groups.</p>';
        }
    });
}

function renderTable(obj, options) {
    var template = '<div class="agol_thumbnail"><img src=${thumbnail} class="agol_img" onclick="searchForItems(' + "'" + obj.id + "'" + ');" /></div><label class="agol_title" onclick="searchForItems(' + "'" + obj.id + "'" + ');"> ${title} </label><span class="agol_owner"> (${owner}) </span><div class="agol_summary">${snippet}</div>';
    obj.url = portalUrl + '/home/group.html?groupid=id:' + obj.id;
    obj.thumbnail = obj.thumbnail || '';
    //console.log(esriLang.substitute(obj, template));
    return div = dojo.create("div", {
        innerHTML: esriLang.substitute(obj, template)
    });
}

function searchForItems(id) {
    // q: 'group:' + id + ' AND type:"Web Map"'
    // q: 'tags:' + 'Fayetteville AND hurricane AND matthew' + ' AND type:"Web Map"'
    if (id === null) {
        id = dijit.byId('groupFinder').get('value');
    }
    if (id !== '') {
        var params = {
            q: 'group:' + id + ' AND type:"Web Map"'
        };
        portal.queryItems(params).then(function (result) {
            showGroupItemResults(result);
        });
    }
}

function showGroupItemResults(response) {
    //clearLabelAndFields();
    require(["dgrid/Grid"], function (Grid) {
        //clear any existing results
        var data = [];
        if (groupGrid) {
            groupGrid.refresh();
        }
        if (response.total > 0) {
            //create an array of attributes for each group - we'll display these in a dojo dgrid
            data = dojo.map(response.results, function (item) {
                //if (item.type === "Web Map") {
                return {
                    'snippet': item.snippet,
                    'title': item.title,
                    'url': item.url,
                    'thumbnail': item.thumbnailUrl || '',
                    'id': item.id,
                    'owner': item.owner
                };
                //}
            });
            //create the grid
            groupGrid = new Grid({
                columns: {
                    thumbnail: 'Group Icon',
                    title: 'Group',
                    snippet: 'Description',
                    id: 'Group ID'
                },
                renderRow: renderItemTable,
                //this function renders the table in a non-grid looking view
                showHeader: false
            }, "grid");
            groupGrid.renderArray(data);
            dojo.byId('groupResults').innerHTML = '';
        } else {
            dojo.byId('groupResults').innerHTML = '<h2>Item Results</h2><p>No items were found inside this group.</p>';
        }
    });
}

function renderItemTable(obj, options) {
    var template = null;
    //if (obj.type === 'Web Map') {
    template = '<div class="agol_thumbnail"><img src=${thumbnail} class="agol_img" onclick="loadWebMap(' + "'" + obj.id + "','" + obj.title + "'" + ');" /></div><label class="agol_title" onclick="loadWebMap(' + "'" + obj.id + "','" + obj.title + "'" + ');"> ${title} </label><span class="agol_owner"> (${owner}) </span><div class="agol_summary">${snippet} </div>';
    //} else {
    //    template = '<div class="agol_thumbnail"><img src=${thumbnail} class="agol_img" onclick="loadFeatureLayer(' + "'" + obj.url + "','" + obj.title + "'" + ');" /></div><label class="agol_title" onclick="loadFeatureLayer(' + "'" + obj.url + "','" + obj.title + "'" + ');"> ${title} </label><span class="agol_owner"> (${owner}) </span><div class="agol_summary">${snippet} </div>';
    //}
    //obj.url = portalUrl + '/home/group.html?groupid=id:' + obj.id;
    obj.thumbnail = obj.thumbnail || '';
    return div = dojo.create("div", {
        innerHTML: esriLang.substitute(obj, template)
    });
}

var myFeatureLayers = [];
var myFeatureLayer = null;
var myIdx = 0;
var myMap = null;

function loadWebMap(id, title) {
    dijit.byId('divOnLine').hide();
    require(["esri/arcgis/utils", "esri/map", "dojo/domReady!"], function (arcgisUtils, Map) {
        try {
            // showWorking('');
            var deferred;
            deferred = arcgisUtils.createMap(id, "ui-map");
            deferred.then(function (response) {
                //   showWorking('');
                var uiMap = response.map;
                var layersNotLoaded = '';
                dojo.forEach(response.itemInfo.itemData.operationalLayers, function (item) {
                    if (item.layerType === "ArcGISFeatureLayer") {
                        if (item.type !== "Feature Collection") {
                            var itemp = '';
                            var itemp_title = '';
                            if (item.popupInfo) {
                                itemp_title = item.popupInfo.title;
                                dojo.forEach(item.popupInfo.fieldInfos, function (itm) {
                                    if (itm.visible) {
                                        itemp += itm.label + ": ${" + itm.fieldName + "} <br />";
                                    }
                                });
                            }
                            var lyr = new esri.layers.FeatureLayer(item.url, {
                                outFields: ["*"],
                                opacity: item.opacity,
                                visible: item.visibility,
                                infoTemplate: (itemp !== '') ? new esri.InfoTemplate(itemp_title, itemp) : null,
                                id: item.id
                            });
                            lyr.setRenderer(item.layerObject.renderer);
                            lyr.on('update-start', function () {
                                log(lyr.id + ' update started');
                                showWorking2();
                            });
                            lyr.on('update-end', function (evt) {
                                log(lyr.id + ' update ended');
                                hideWorking2();
                            });
                            lyr.on('load', function (evt) {
                                log(lyr.id + ' load started');
                                showWorking2();
                            });
                            lyr.on('update', function () {
                                log(lyr.id + ' update ended');
                                hideWorking2();
                            });
                            alyr = { id: item.id, title: item.title, url: item.url, renderer: item.layerObject.renderer, opacity: item.opacity, visible: item.visibility, info: (itemp !== '') ? new esri.InfoTemplate(itemp_title, itemp) : null };
                            map.addLayer(lyr);
                            myFeatureLayers.push(alyr);
                            addFeatureLayerTOC(alyr);
                        } else {
                            layersNotLoaded += item.title + "<br />";
                        }
                    }
                });
                if (layersNotLoaded !== '') {
                    myInfo('Layers Not Loaded <br />' + layersNotLoaded);
                }
                if (childWindow && childWindow.window) {
                    childWindow.$(childWindow.document).trigger('childWindow', 'online|' + id);
                }
                uiMap.destroy();
                uiMap = null;
                // hideWorking();
            }, function (error) {
                console.log("Error: ", error.code, " Message: ", error.message);
                //  hideWorking();
                deferred.cancel();
            });
        } catch (err) {
            console.log("Error: ", err.code, " Message: ", err.message);
        } finally {
            // hideWorking();
        }
    });
}

function loadFeatureLayer(url, title) {
    // clearLabelAndFields();
    dijit.byId('txtOnLineLabel').set('value', title);
    myFeatureLayer = null;
    if (!myMap) {
        myMap = new esri.Map('myFeatureLayerMap');
    } else {
        myMap.removeAllLayers();
    }
    myFeatureLayer = new esri.layers.FeatureLayer(url + '/0', {
        mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        visible: true
    });
    myFeatureLayer.on('load', function (evt) {
        //dijit.byId('lbxFields').removeOption(dijit.byId('lbxFields').getOptions());
        lst = dojo.byId('lbxFields');
        while (lst.options.length) {
            lst.remove(0);
        }
        dojo.forEach(evt.layer.fields, function (f) {
            if (f.type != 'esriFieldTypeOID') {
                newOpt = dojo.doc.createElement('option');
                newOpt.text = f.alias;
                newOpt.value = f.name + ',' + f.type;
                lst.options.add(newOpt);
            }
        });
    });
    myMap.addLayer(myFeatureLayer);
}

//function clearLabelAndFields() {
//    dijit.byId('txtOnLineLabel').set('value', '');
//    while (dojo.byId('lbxFields').options.length) {
//        dojo.byId('lbxFields').remove(0);
//    }
//    while (dojo.byId('lbxPopupFields').options.length) {
//        dojo.byId('lbxPopupFields').remove(0);
//    }
//}

//function addOnLineField(evt) {
//    try {
//        fromBox = dojo.byId('lbxFields');
//        toBox = dojo.byId('lbxPopupFields');
//        var selVal = fromBox.options[fromBox.selectedIndex].value;
//        var i;
//        for (i = toBox.length - 1; i >= 0; i--) {
//            if (toBox[i].value == selVal) {
//                return;
//            }
//        }
//        var newOpt = dojo.doc.createElement('option');
//        newOpt.text = fromBox.options[fromBox.selectedIndex].text;
//        newOpt.value = selVal;
//        toBox.options.add(newOpt);
//    } catch (e) {
//        eh(e, 'addOnLineField');
//    }
//}

//function removeOnLineField(evt) {
//    try {
//        toBox = dojo.byId('lbxPopupFields');
//        var i;
//        for (i = toBox.length - 1; i >= 0; i--) {
//            if (toBox.options[i].selected) {
//                toBox.remove(i);
//            }
//        }
//    } catch (e) {
//        eh(e, 'removeOnLineField(evt)');
//    }
//}

function closeOnLine(evt) {
    //    info = '';
    //    lst = dojo.byId('lbxPopupFields');
    //    for (var i = 0; i <= lst.length - 1; i++) {
    //        ary = lst.options[i].value.split(',');
    //        if (ary[1] == 'esriFieldTypeDate') {
    //            (info == '') ? info = lst.options[i].text + ": ${" + ary[0] + ":formatDateIW}" : info += "<br />" + lst.options[i].text + ": ${" + ary[0] + ":formatDateIW}";
    //        } else {
    //            (info == '') ? info = lst.options[i].text + ": ${" + ary[0] + "}" : info += "<br />" + lst.options[i].text + ": ${" + ary[0] + "}";
    //        }
    //    }

    //    lyr = new esri.layers.FeatureLayer(myFeatureLayer.url, {
    //        mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
    //        outFields: ["*"],
    //        visible: false,
    //        infoTemplate: new esri.InfoTemplate('Info', info),
    //        id: 'flayer_' + myIdx
    //    });
    //    alyr = { id: 'flayer_' + myIdx, title: dijit.byId('txtOnLineLabel').get('value'), url: myFeatureLayer.url, info: info };
    //    myIdx += 1;
    //    map.addLayer(lyr);
    //    myFeatureLayers.push(alyr);
    //    addFeatureLayerTOC(alyr);
    //    myMap.destroy();
    //    myMap = null;
    //    clearLabelAndFields();
    //    if (childWindow && childWindow.window) {
    //        childWindow.$(childWindow.document).trigger('childWindow', 'online|' + 'flayer_' + myIdx + '|' + myFeatureLayer.url + '|' + info);
    //    }
    //    dijit.byId('divOnLine').hide();
}

function cancelOnLine(evt) {
    if (myMap) {
        myMap.destroy();
        myMap = null;
    }
    dijit.byId('divOnLine').hide();
}

function createOnLinePane() {
    //add arcgis online pane
    if (!isMain) { return; }
    var new_acc = dijit.byId('tocAccordion');
    var to = dojo.create('table', null, null, 'only');
    //to.border = 1;
    var tt = dojo.create('tbody', { id: 'myFeatureLayerBody' }, to);
    row = dojo.create('tr', null, tt, 'last');
    td = dojo.create('td', { colSpan: 3 }, row, 'last');

    var to2 = dojo.create('table', null, td, 'only');
    var tt2 = dojo.create('tbody', null, to2);
    row2 = dojo.create('tr', null, tt2, 'last');
    td2 = dojo.create('td', null, row2, 'last');
    div = dojo.create('div', null, td2);
    btn = new dijit.form.Button({
        label: 'Online Map',
        showLabel: true,
        iconClass: "addIcon",
        style: "float: left",
        onClick: function (evt) {
            dijit.byId('divOnLine').show();
            var signInLink = dojo.byId('signIn');
            if (signInLink.innerHTML.indexOf('In') !== -1) {
                portal.signIn().then(function (loggedInUser) {
                    signInLink.innerHTML = "Sign Out";
                    findArcGISGroup();
                }, function (error) {
                    signInLink.innerHTML = 'Sign In';
                });
            }
        }
    }, div);
    td2 = dojo.create('td', null, row2, 'last');
    div2 = dojo.create('div', null, td2);
    btn = new dijit.form.Button({
        label: 'Remove All',
        showLabel: true,
        iconClass: "trashIcon",
        style: "float: right",
        onClick: function (evt) {
            dojo.forEach(dojo.query('.ToggleControl2 >'), function (itm) {
                var id = itm.id.split('|')[1];
                var layer = map.getLayer(id);
                map.removeLayer(layer);
                rowid = 'FeatureLayer|' + id + '|TR';
                //chkid = 'FeatureLayer|' + id + '|CHK';
                var chk = dijit.byId('FeatureLayer|' + id + '|CHK');
                chk.destroyRecursive(false);
                tr = document.getElementById(rowid);
                if (tr) {
                    while (tr.hasChildNodes()) {
                        if (tr.lastChild.hasChildNodes()) {
                            while (tr.lastChild.hasChildNodes()) {
                                tr.lastChild.removeChild(tr.lastChild.lastChild);
                            }
                        }
                        tr.removeChild(tr.lastChild);
                    }
                }
                tr.parentNode.removeChild(tr);
                if (childWindow && childWindow.window) {
                    childWindow.$(childWindow.document).trigger('childWindow', 'online_remove|' + id);
                }
            });
        }
    }, div2);
    new_acc.addChild(new dijit.layout.AccordionPane({
        title: 'ArcGIS Online Events',
        id: 'accOnLine',
        content: to,
        onFocus: function () {
            ufocus();
        }
    }));
}

function addFeatureLayerTOC(alyr) {
    var tt = dojo.byId('myFeatureLayerBody');
    row = dojo.create('tr', { id: 'FeatureLayer|' + alyr.id + '|TR' }, tt, 'last');
    var tdx = dojo.create('td', { innerHTML: "<img id='FeatureLayer|" + alyr.id + "|IMG'" + " src='img/x.png' onclick='deleteFeatureLayer(this);' style='cursor: pointer;' />", style: 'padding: 4px 0px 0px 0px;' }, row, 'last');
    td = dojo.create('td', { class: 'checkCell2' }, row, 'last');
    div = dojo.create('div', null, td);
    try {
        var layerChk = new dijit.form.CheckBox({
            id: 'FeatureLayer|' + alyr.id + '|CHK',
            checked: alyr.visible,
            title: 'Visible in Map',
            style: 'margin: 4px 0px 0px 0px;',
            class: 'ToggleControl2'
        }, div);
    } catch (e) {
        eh(e, 'FeatureLayerTOC');
    }
    dojo.connect(layerChk, 'onChange', toggleFeatureLayer);
    dojo.create('td', {
        innerHTML: "<div class=\"tocItem\">&nbsp;<label for='" + 'FeatureLayer|' + alyr.id + '|CHK' + "'>" + alyr.title + "</label></div>",
        style: "cursor: pointer"
    }, row, 'last');
}

function turnOffAllOnLine() {
    dojo.forEach(dojo.query('.ToggleControl2 >'), function (chk) {
        if (chk.checked) {
            ary = chk.id.split('|');
            map.getLayer(ary[1]).hide();
            dijit.byId(chk.id).set('checked', false);
        }
    });
}

function deleteFeatureLayer(elm) {
    var id = elm.id.split('|')[1];
    var layer = map.getLayer(id);
    map.removeLayer(layer);
    rowid = 'FeatureLayer|' + id + '|TR';
    tr = document.getElementById(rowid);
    tr.parentNode.removeChild(tr);
    if (childWindow && childWindow.window) {
        childWindow.$(childWindow.document).trigger('childWindow', 'online_remove|' + id);
    }
}

function toggleFeatureLayer(evt) {
    var id = this.id.split('|')[1];
    var layer = map.getLayer(id);
    (layer.visible) ? layer.hide() : layer.show();
    if (childWindow && childWindow.window) {
        childWindow.$(childWindow.document).trigger('childWindow', 'online_visibility|' + id + '|' + layer.visible);
    }
}
