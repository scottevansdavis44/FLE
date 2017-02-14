var myToken = null;
var graphicsLayer = null;
var avlDefaultSymbol = null;
var avlFont = null;
var incidentDefaultSymbol = null;
var incidentFont = null;
var myRefreshToken = null;

function onKeyUp_txtPassword(evt) {
    if (evt.keyCode === dojo.keys.ENTER) {
        marvlis_login_check(null);
    }
}

function marvlis_login() {
    if (dojo.cookie('psap_user') && dojo.cookie('psap_pwd')) {
        var u = dojo.fromJson(dojo.cookie('psap_user'));
        var p = dojo.fromJson(dojo.cookie('psap_pwd'));
        marlvisRequest(u, p);
    } else {
        dijit.byId("dialogLogin").show();
    }
}

function marvlis_login_check(evt) {
    var u = dijit.byId("txtUserName").get('value');
    if (u === '') {
        myAlert('Please enter user name.');
        return;
    }
    var p = dijit.byId("txtPassword").get('value');
    if (p === '') {
        myAlert('Please enter password.');
        return;
    }
    dijit.byId("dialogLogin").hide();
    marlvisRequest(u, p);
}

function marlvisRequest(u, p) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", marvlis + "/web/api/token", true);
    xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
    //xhr.setRequestHeader("cache-control", "no-cache");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            //console.log(this.responseText);
            var rsp = dojo.fromJson(xhr.response);
            if (rsp['access_token']) {
                dojo.cookie('psap_user', dojo.toJson(u), { expires: 10 });
                dojo.cookie('psap_pwd', dojo.toJson(p), { expires: 10 });
                myToken = rsp['token_type'] + ' ' + rsp['access_token'];
                myRefreshToken = rsp['refresh_token'];
                setInterval(function () {
                    marlvisRequestRefresh();
                }, 540000);
                mapInit();
            } else {
                myAlert(rsp['error_description']);
                dijit.byId("dialogLogin").show();
            }
        }
    };
    var data = "username=" + u + "&password=" + p + "&grant_type=password&client_id=ngAuthApp";
    xhr.send(data);
}

function marlvisRequestRefresh() {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", marvlis + "/web/api/token", true);
    xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            //console.log(xhr.responseText);
            var rsp = dojo.fromJson(xhr.response);
            if (rsp['access_token']) {
                myToken = rsp['token_type'] + ' ' + rsp['access_token'];
                myRefreshToken = rsp['refresh_token'];
            } else {
                myAlert(rsp['error_description']);
                dijit.byId("dialogLogin").show();
            }
        };
    };
    var u = dojo.fromJson(dojo.cookie('psap_user'));
    var p = dojo.fromJson(dojo.cookie('psap_pwd'));
    var data = "username=" + u + "&password=" + p + "&grant_type=password&client_id=ngAuthApp";
    xhr.send(data);
}

function initMapAVL() {
    require(['esri/renderers/UniqueValueRenderer', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/Color', 'esri/symbols/TextSymbol', 'esri/symbols/Font'], function (UniqueValueRenderer, SimpleMarkerSymbol, SimpleLineSymbol, Color, TextSymbol, Font) {
        avlDefaultSymbol = new SimpleMarkerSymbol()
                .setStyle(SimpleMarkerSymbol.STYLE_PATH)
                .setPath(vehicleStatusColorDefault.path)
                .setColor(vehicleStatusColorDefault.color)
                .setSize(vehicleStatusColorDefault.size)
                .setOutline(null);
        //.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, vehicleStatusColorDefault.outlinecolor, 2));
        avlFont = new Font('11pt', Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, '"Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif');
        var avlRenderer = new UniqueValueRenderer(avlDefaultSymbol, vehicleStatusColorField);
        dojo.forEach(vehicleStatusColor, function (itm) {
            dojo.forEach(itm.value, function (val) {
                sym = new SimpleMarkerSymbol()
                        .setStyle(SimpleMarkerSymbol.STYLE_PATH)
                        .setPath(itm.path)
                        .setColor(itm.color)
                        .setSize(itm.size);
                (!itm.outlinecolor) ? sym.setOutline(null) : sym.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, itm.outlinecolor, 2));
                avlRenderer.addValue(val, sym);
            });
        });
        avlRenderer.setRotationInfo({ field: "heading", type: "geographic" });
        var sel = new dijit.form.Select({
            id: "selectAVLSort",
            name: "selectAVLSort",
            value: 'District:A',
            options: [{ value: 'Unit:A', label: 'Unit' }, { value: 'District:A', label: 'District', selected: true }, { value: 'Availability:A', label: 'Status' }]
        });
        dojo.byId('tdAVLSort').appendChild(sel.domNode);
        sel.startup();
        vehicleLayer = new esri.layers.GraphicsLayer({
            id: 'avl_law',
            displayOnPan: true,
            opacity: 1.0,
            visible: true
        });
        vehicleLayer.setRenderer(avlRenderer);
        vehicleLabelLayer = new esri.layers.GraphicsLayer({
            id: 'avl_law_label',
            displayOnPan: true,
            opacity: 1.0,
            visible: true
        });
        layersToAdd.push(vehicleLabelLayer, vehicleLayer);
        mapAVL();
        setInterval(function () {
            mapAVL();
        }, 1000);
    });
}

function mapAVL() {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", marvlis + "/web/api/state/vehicles");
    xhr.setRequestHeader("authorization", myToken);
    //xhr.setRequestHeader("cache-control", "no-cache");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            //console.log(xhr.responseText);
            var rsp = dojo.fromJson(xhr.response);
            if (rsp['features']) {
                mapAVLGraphics(rsp);
            } else {
                myAlert(rsp['error_description']);
            }
        }
    }
    xhr.send(null);
}

function initMapIncident() {
    require(['esri/renderers/UniqueValueRenderer', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/Color', 'esri/symbols/TextSymbol', 'esri/symbols/Font'], function (UniqueValueRenderer, SimpleMarkerSymbol, SimpleLineSymbol, Color, TextSymbol, Font) {
        incidentDefaultSymbol = new SimpleMarkerSymbol()
                .setStyle(SimpleMarkerSymbol.STYLE_PATH)
                .setPath("m 256,128 c -44.183,0 -80,35.817 -80,80 0,80 80,176 80,176 0,0 80,-96 80,-176 0,-44.183 -35.8175,-80 -80,-80 z m 0,128 c -26.51,0 -48,-21.49 -48,-48 0,-26.51 21.49,-48 48,-48 26.51,0 48,21.49 48,48 0,26.51 -21.49,48 -48,48 z")
                .setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 0, 0]), 3))
                .setSize(24)
                .setOffset(0, 12)
                .setColor(incidentStatusColorDefault.color)
                .setOutline(null);
        incidentFont = new Font('11pt', Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, '"Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif');
        var incidentRenderer = new UniqueValueRenderer(incidentDefaultSymbol, incidentStatusColorField);
        dojo.forEach(incidentStatusColor, function (itm) {
            dojo.forEach(itm.value, function (val) {
                sym = new SimpleMarkerSymbol()
                    .setStyle(SimpleMarkerSymbol.STYLE_PATH)
                    .setPath("m 256,128 c -44.183,0 -80,35.817 -80,80 0,80 80,176 80,176 0,0 80,-96 80,-176 0,-44.183 -35.8175,-80 -80,-80 z m 0,128 c -26.51,0 -48,-21.49 -48,-48 0,-26.51 21.49,-48 48,-48 26.51,0 48,21.49 48,48 0,26.51 -21.49,48 -48,48 z")
                    .setColor(itm.color)
                    .setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0]), 3))
                    .setOffset(0, 12)
                    .setSize(24);
                incidentRenderer.addValue(val, sym);
            });
        });
        sel = new dijit.form.Select({
            id: "selectCFSSort",
            name: "selectCFSSort",
            value: 'Priority:A',
            options: [{ value: 'Priority:A', label: 'Priority', selected: true }, { value: 'District:A', label: 'District' }, { value: 'TimeReceived:D', label: 'Time Received' }]
        });
        dojo.byId('tdCFSSort').appendChild(sel.domNode);
        sel.startup();
        incidentLayer = new esri.layers.GraphicsLayer({
            id: 'cfs',
            displayOnPan: true,
            opacity: 1.0,
            visible: true
        });
        incidentLayer.setRenderer(incidentRenderer);
        layersToAdd.push(incidentLayer);
        incidentLabelLayer = new esri.layers.GraphicsLayer({
            id: 'cfs_label',
            displayOnPan: true,
            opacity: 1.0,
            visible: true
        });
        layersToAdd.push(incidentLabelLayer);
        mapIncident();
        setInterval(function () {
            mapIncident();
        }, 5000);
    });
}

function mapIncident() {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", marvlis + "/web/api/state/incidents");
    xhr.setRequestHeader("authorization", myToken);
    //xhr.setRequestHeader("cache-control", "no-cache");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            //console.log(xhr.responseText);
            var rsp = dojo.fromJson(xhr.response);
            if (rsp['features']) {
                mapIncidentGraphics(rsp);
            } else {
                myAlert(rsp['error_description']);
            }
        }
    }
    xhr.send(null);
}

function mapAVLGraphics(data) {
    require(['esri/graphic', 'esri/Color', 'esri/symbols/TextSymbol', 'esri/geometry/Polyline', 'esri/symbols/SimpleLineSymbol'], function (Graphic, Color, TextSymbol, Polyline, SimpleLineSymbol) {
        var f = data.features.map(function (x) {
            var c = x.geometry.coordinates;
            return new Graphic({
                geometry: { x: c[0], y: c[1], spatialReference: { wkid: 4326 } },
                symbol: avlDefaultSymbol,
                attributes: x.properties,
                infoTemplate: { title: vehicleInfoTemplateTitle, content: vehicleInfoTemplate }
            });
        });
        vehicleLayer.clear();
        vehicleLabelLayer.clear();
        f.map(function (x) {
            if (x.attributes['incidentID']) {
                var i = dojo.filter(incidentLayer.graphics, function (itm) {
                    return itm.attributes['incidentNumber'] === 'INC' + x.attributes['incidentID'];
                });
                if (i.length) {
                    vehicleLabelLayer.add(new Graphic(new Polyline([[x.geometry.x, x.geometry.y], [i[0].geometry.x, i[0].geometry.y]]), new SimpleLineSymbol(SimpleLineSymbol.STYLE_DOT, new Color([255, 0, 0]), 2)));
                }
            }
            vehicleLayer.add(x);
            vehicleLabelLayer.add(new esri.Graphic(x.geometry, new TextSymbol(x.attributes[vehicleLabel]).setColor(new Color([0, 0, 0])).setOffset(20, 10).setFont(avlFont).setKerning(false).setHaloColor(new Color([190, 190, 190, 0.5])).setHaloSize(3), x.attributes));
        });
        generateFeedRecords();
    });
}

function mapIncidentGraphics(data) {
    require(['esri/graphic', 'esri/Color', 'esri/symbols/TextSymbol'], function (Graphic, Color, TextSymbol) {
        var f = data.features.map(function (x) {
            var c = x.geometry.coordinates;
            return new Graphic({
                geometry: { x: c[0], y: c[1], spatialReference: { wkid: 4326 } },
                symbol: incidentDefaultSymbol,
                attributes: x.properties,
                infoTemplate: { title: incidentInfoTemplateTitle, content: incidentInfoTemplate }
            });
        });
        incidentLayer.clear();
        incidentLabelLayer.clear();
        f.map(function (x) {
            incidentLayer.add(x);
            incidentLabelLayer.add(new esri.Graphic(x.geometry, new TextSymbol(x.attributes[incidentLabel]).setColor(new Color([255, 0, 0])).setOffset(42, 10).setFont(incidentFont).setKerning(false).setHaloColor(new Color([10, 10, 10, 0.5])).setHaloSize(3), x.attributes));
        });
        generateIncidentRecords();
    });
}
