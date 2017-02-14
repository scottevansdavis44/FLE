function createNewTOC() {
    try {
        var dary = [];
        var mainLayer = map.getLayer('Overlay_Map');
        //var camLayer = map.getLayer('Cameras');
        var lyrary = [map.getLayer('Overlay_Map')];
        dary.push(createLayerTOC(mainLayer));
        //dary.push(createLayerTOC(camLayer));
        var dl = new dojo.DeferredList(dary);
        dl.then(function (returns) {
            var to = dojo.create('table', null, null, 'only');
            //to.border = 1;
            var tt = dojo.create('tbody', null, to);
            dojo.forEach(returns, function (rtn, i) {
                var layers = rtn[1].layers;
                dojo.forEach(layers, function (lyr) {
                    if (lyr.legend.length == 1) {
                        row = dojo.create('tr', {
                            id: lyrary[i].id + '-' + lyr.layerId + '-TocItem'
                        }, tt, 'last');
                        td0 = dojo.create('td', {
                            innerHTML: "<img src='img/blank.png'>"
                        }, row, 'last');
                        td = dojo.create('td', {
                            class: 'checkCell2'
                        }, row, 'last');
                        div = dojo.create('div', null, td);
                        id = lyrary[i].id + '-' + lyr.layerId + '-CHK';
                        chkd = (lyrary[i].visibleLayers.indexOf(lyr.layerId) > -1);
                        try {
                            var layerChk = new dijit.form.CheckBox({
                                id: id,
                                checked: chkd,
                                title: 'Visible in Map',
                                style: 'margin: 4px 0 0 0;',
                                onChange: toggleRefrenceMapServiceLayer,
                                class: lyrary[i].id
                            }, div);
                        } catch (e) {
                            eh(e, 'createNewTOC');
                        }
                        //layerChk.set('class', lyrary[i].id);
                        //dojo.connect(layerChk, 'onClick', toggleRefrenceMapServiceLayer);
                        var src = lyrary[i].url + '/' + lyr.layerId + '/images/' + lyr.legend[0].url;
                        dojo.create('td', {
                            innerHTML: "<div class=\"tocItem\"><img style=\"vertical-align:middle;\" src='" + src + "'/>&nbsp;<label style='color: white' for='" + id + "'>" + lyr.layerName + "</label></div>",
                            style: "cursor: pointer"
                        }, row, 'last');
                        //                        td3.onclick = function () {
                        //                            dijit.byId(id).set('checked', !dijit.byId(id).checked);
                        //                        }
                    } else {
                        row = dojo.create('tr', null, tt, 'last');
                        td0in = "<img id='" + lyrary[i].id + "-" + lyr.layerId + "-Icon' src='img/expand.png' onclick=\"toggleLayer('" + lyrary[i].id + "-" + lyr.layerId + "')\" >";
                        td0 = dojo.create('td', {
                            innerHTML: td0in,
                            class: 'expandCell'
                        }, row, 'last');
                        td = dojo.create('td', {
                            class: 'checkCell2'
                        }, row, 'last');
                        div = dojo.create('div', null, td);
                        id = lyrary[i].id + '-' + lyr.layerId + '-CHK';
                        chkd = (lyrary[i].visibleLayers.indexOf(lyr.layerId) > -1);
                        var layerChk = new dijit.form.CheckBox({
                            id: id,
                            checked: chkd,
                            title: 'Visible in Map',
                            style: 'margin: 4px 0 0 0;',
                            onChange: toggleRefrenceMapServiceLayer,
                            class: lyrary[i].id
                        }, div);
                        //layerChk.set('class', lyrary[i].id);
                        //dojo.connect(layerChk, 'onClick', toggleRefrenceMapServiceLayer);
                        //                        onChange: function (evt) {
                        //                            toggleRefrenceMapServiceLayer(id);
                        //                        }
                        td2 = dojo.create('td', {
                            innerHTML: "&nbsp;<label style='color: white' class=\"tocItem\" for='" + id + "'>" + lyr.layerName + "</label>",
                            style: "cursor: pointer"
                        }, row, 'last');
                        //                        td2.onclick = function () {
                        //                            dijit.byId(id).set('checked', !dijit.byId(id).checked);
                        //                        }
                        tl = lyr.legend.length;
                        row = dojo.create('tr', {
                            id: lyrary[i].id + '-' + lyr.layerId + '-TocItem',
                            style: 'display: none;'
                        }, tt, 'last');
                        currentHTML = "<div id='" + lyr.layerId + "-Layers'>";
                        dojo.forEach(lyr.legend, function (legend, j) {
                            var src = lyrary[i].url + '/' + lyr.layerId + '/images/' + legend.url;
                            currentHTML += "<img style=\"vertical-align:middle;\" src='" + src + "'/>&nbsp;<label style='color: white' class=\"tocItem\">" + legend.label + "</label><br />";
                        });
                        dojo.create('td', {
                            innerHTML: "<img src='img/blank.png'>"
                        }, row, 'last');
                        dojo.create('td', {
                            innerHTML: "<img src='img/blank.png'>"
                        }, row, 'last');
                        dojo.create('td', {
                            innerHTML: currentHTML + '</div>'
                        }, row, 'last');
                    }
                });
            });
            dojo.byId('toc').appendChild(to);
        });

    } catch (err) {
        eh(err, 'createNewTOC');
    }
}

function createLayerTOC(layer) {
    return esri.request({
        url: layer.url + '/legend',
        useProxy: true,
        disableIdentityLookup: true,
        content: {
            f: 'json'
        },
        handleAs: 'json',
        preventCache: true,
        callbackParamName: 'callback',
        load: function (response, io) {
        },
        error: function (error, io) {
            log('An error occured, please refresh your browser.');
        }
    });
}

function toggleLayer(id) {
    try {
        var layerTR = dojo.byId(id + '-TocItem');
        var icon = dojo.byId(id + '-Icon');
        if (layerTR.style.display == 'table-row') {
            icon.src = 'img/expand.png';
            layerTR.style.display = 'none';
        } else {
            icon.src = 'img/close.png';
            layerTR.style.display = 'table-row';
        }
    } catch (err) {
        eh(err, 'toggleLayer');
    }
}

function toggleRefrenceMapServiceLayer(evt) {
    var id = this.id.split('-')[0];
    var visible = [];
    dojo.forEach(dojo.query('.' + id + ' >'), function (layer) {
        (layer.checked) ? visible.push(parseInt(layer.id.split('-')[1])) : null;
    });
    map.infoWindow.hide();
    (visible.length > 0) ? map.getLayer(id).setVisibleLayers(visible) : map.getLayer(id).setVisibleLayers([-1]);
}

function createFeedTOC() {
    try {
        var to = dojo.create('table', null, null, 'only');
        var tt = dojo.create('tbody', null, to);
        dojo.forEach(feedLayerTOC, function (lyr) {
            row = dojo.create('tr', { id: 'feed-' + lyr.id + '-TocItem', style: 'cursor: pointer;' }, tt, 'last');
            if (lyr.legend) {
                td0 = dojo.create('td', { innerHTML: "<img src='img/legend.png'>", style: "padding-top: 4px; cursor: pointer;" }, row, 'last');
                td0.onclick = function (evt) {
                    if (map.getLayer(lyr.id).visible) {
                        feedLegend(lyr.legend.layer, lyr.legend.title);
                    }
                }

            } else {
                td0 = dojo.create('td', { innerHTML: "<img src='img/blank.png'>" }, row, 'last');
            }
            td = dojo.create('td', { class: 'checkCell2' }, row, 'last');
            div = dojo.create('div', null, td);
            id = 'feed-' + lyr.id + '-CHK';
            try {
                var layerChk = new dijit.form.CheckBox({
                    id: id,
                    checked: (map.getLayer(lyr.id)) ? map.getLayer(lyr.id).visible : false,
                    title: 'Visible in Map',
                    style: 'margin: 4px 0 0 0; cursor: pointer;',
                    onClick: function (evt) {
                        var id = evt.target.id.split('-')[1];
                        if (evt.target.checked) {
                            map.getLayer(id).show();
                        } else {
                            if (dojo.hasClass("divLegend", "visible")) { dojo.replaceClass("divLegend", "hidden", "visible"); }
                            map.getLayer(id).hide();
                        }
                    }
                }, div);
            } catch (e) {
                eh(e, 'createFeedTOC');
            }
            td2 = dojo.create('td', { innerHTML: "&nbsp;<label class=\"tocItem\" for='" + id + "' style: 'cursor: pointer;'>" + lyr.label + "</label>", style: "cursor: pointer; color: white;" }, row, 'last');
        });
        dojo.byId('feeds').appendChild(to);
    } catch (err) {
        eh(err, 'createFeedTOC');
    }
}

var legendDijit = null;

function feedLegend(layer, title) {
    //dojo.replaceClass("divFeeds", "hidden", "visible");
    (dojo.hasClass("divLegend", "visible")) ? dojo.replaceClass("divLegend", "hidden", "visible") : dojo.replaceClass("divLegend", "visible", "hidden");
    layerInfo = [];
    layerInfo.push({ layer: layer, title: title });
    if (legendDijit) {
        //RemoveChildren(dojo.byId('legend'));
        //legendDijit.destroy();
        legendDijit.refresh(layerInfo);
    } else {
        require(["esri/dijit/Legend"], function (Legend) {
            legendDijit = new Legend({
                map: map,
                layerInfos: layerInfo
            }, "legend");
            legendDijit.startup();
        });
    }
}

