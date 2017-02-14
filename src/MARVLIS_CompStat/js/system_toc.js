function createNewTOC() {
    try {
        var dary = [];
        var mainLayer = map.getLayer('overlayMapServiceLayer');
        dary.push(createLayerTOC(mainLayer));
        var dl = new dojo.DeferredList(dary);
        dl.then(function (returns) {
            var to = dojo.create('table', { style: "letter-spacing: normal" }, null, 'only');
            //to.border = 1;
            var tt = dojo.create('tbody', null, to);
            dojo.forEach(returns, function (rtn) {
                var layers = rtn[1].layers;
                dojo.forEach(layers, function (lyr) {
                    if (lyr.legend.length == 1) {
                        row = dojo.create('tr', {
                            id: mainLayer.id + '-' + lyr.layerId + '-TocItem'
                        }, tt, 'last');
                        td0 = dojo.create('td', {
                            innerHTML: "<img src='img/blank.png'>"
                        }, row, 'last');
                        td = dojo.create('td', {
                            class: 'checkCell2'
                        }, row, 'last');
                        div = dojo.create('div', null, td);
                        id = mainLayer.id + '-' + lyr.layerId + '-CHK';
                        chkd = (mainLayer.visibleLayers.indexOf(lyr.layerId) > -1);
                        try {
                            var layerChk = new dijit.form.CheckBox({
                                id: id,
                                checked: chkd,
                                title: 'Visible in Map',
                                style: 'margin: 4px 0px 0px 0px;',
                                class: mainLayer.id,
                                onChange: toggleRefrenceMapServiceLayer
                            }, div);
                        } catch (e) {
                            eh(e, 'createNewTOC');
                        }
                        //layerChk.set('class', mainLayer.id);
                        //dojo.connect(layerChk, 'onClick', toggleRefrenceMapServiceLayer);
                        var src = mainLayer.url + '/' + lyr.layerId + '/images/' + lyr.legend[0].url;
                        dojo.create('td', {
                            innerHTML: "<div class=\"tocItem\"><img style=\"vertical-align:middle;\" src='" + src + "'/>&nbsp;<label for='" + id + "'>" + lyr.layerName + "</label></div>",
                            style: "cursor: pointer"
                        }, row, 'last');
                    } else {
                        row = dojo.create('tr', null, tt, 'last');
                        td0in = "<img id='" + mainLayer.id + "-" + lyr.layerId + "-Icon' src='img/expand.png' onclick=\"toggleLayer('" + mainLayer.id + "-" + lyr.layerId + "')\" >";
                        td0 = dojo.create('td', {
                            innerHTML: td0in,
                            class: 'expandCell'
                        }, row, 'last');
                        td = dojo.create('td', {
                            class: 'checkCell2'
                        }, row, 'last');
                        div = dojo.create('div', null, td);
                        id = mainLayer.id + '-' + lyr.layerId + '-CHK';
                        chkd = (mainLayer.visibleLayers.indexOf(lyr.layerId) > -1);
                        var layerChk = new dijit.form.CheckBox({
                            id: id,
                            checked: chkd,
                            title: 'Visible in Map',
                            style: 'margin: 4px 0px 0px 0px;',
                            class: mainLayer.id,
                            onChange: toggleRefrenceMapServiceLayer
                        }, div);
                        //layerChk.set('class', mainLayer.id);
                        //dojo.connect(layerChk, 'onClick', toggleRefrenceMapServiceLayer);
                        td2 = dojo.create('td', {
                            innerHTML: "&nbsp;<label class=\"tocItem\" for='" + id + "'>" + lyr.layerName + "</label>",
                            style: "cursor: pointer"
                        }, row, 'last');
                        tl = lyr.legend.length;
                        row = dojo.create('tr', {
                            id: mainLayer.id + '-' + lyr.layerId + '-TocItem',
                            style: 'display: none;'
                        }, tt, 'last');
                        currentHTML = "<div id='" + lyr.layerId + "-Layers'>";
                        dojo.forEach(lyr.legend, function (legend, j) {
                            var src = mainLayer.url + '/' + lyr.layerId + '/images/' + legend.url;
                            currentHTML += "<img style=\"vertical-align:middle;\" src='" + src + "'/>&nbsp;<label class=\"tocItem\">" + legend.label + "</label><br />";
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
            dijit.byId('tocAccordion').addChild(new dijit.layout.AccordionPane({
                title: 'Overlay Layers',
                content: to
            }));
        });

    } catch (e) {
        eh(e, 'createNewTOC');
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
    } catch (e) {
        eh(e, 'toggleLayer');
    }
}

function toggleRefrenceMapServiceLayer(evt) {
    var id = this.id.split('-')[0];
    var refLayers = dojo.query('.' + id + ' >');
    var visible = [];
    dojo.forEach(refLayers, function (layer) {
        if (layer.checked) {
            visible.push(parseInt(layer.id.split('-')[1]));
        }
    });
    if (visible.length > 0) {
        try {
            if (isMain) {
                if (childWindow && childWindow.window) {
                    childWindow.$(childWindow.document).trigger('childWindow', 'vislyr|overlayMapServiceLayer|' + dojo.toJson(visible));
                }
            }
        } finally {
            map.infoWindow.hide();
            map.getLayer(id).setVisibleLayers(visible);
        }
    }
}

