function selectLocationType_onChange(val) {
  try {
    RemoveChildren(dojo.byId('locateList'));
    if (val == '') {
      return;
    }
    showWorking('constructing searches ...');
    var ary = val.split('|');
    var geo = null;
    var textValue = '';
    if (!dijit.byId('dttQuickZoom').options[0].selected) {
      dojo.forEach(dijit.byId('dttQuickZoom').getOptions(), function(opt, i) {
        if (opt.selected) {
          geo = esri.geometry.fromJson(dojo.fromJson(opt.value));
          if (i != 0) {
            textValue = opt.label;
          }
        }
      });
    }
    var dary = [];
    dary.push(createResultArray(ary[0], ary[1], ary[2], textValue, geo));
    var dl = new dojo.DeferredList(dary);
    dl.then(function(returns) {
      dojo.forEach(returns, function(rtn, j) {
        var table = dojo.create('table', {
          class : 'tableLocations'
        }, null, 'only');
        var tBody = dojo.create('tbody', null, table);
        var pval = '';
        dojo.forEach(rtn[1].features, function(feature, i) {
          var trimmed = dojo.string.trim(feature.attributes[ary[1]]);
          if (trimmed != '' && trimmed != pval) {
            var tr = dojo.create('tr', null, tBody, 'last');
            var td0 = dojo.create('td', {
              id : 'list_' + i,
              innerHTML : trimmed,
              class : 'tdLocations'
            }, tr, 'last');
            td0.setAttribute('oid', i + '');
            td0.setAttribute('geo', dojo.toJson(feature.geometry.toJson()));
            td0.onclick = function() {
              showWorking('');
              var inputs = dojo.query('.tdLocationsSelected');
              dojo.forEach(inputs, function(input) {
                input.className = 'tdLocations';
              });
              dojo.byId('list_' + this.attributes.oid.value).className = 'tdLocationsSelected';
              if (isMain) {
                if (childWindow && childWindow.window) {
                  childWindow.$(childWindow.document).trigger('childWindow', 'hilite|' + this.attributes.geo.value);
                }
              }
              var geo = esri.geometry.fromJson(dojo.fromJson(this.attributes.geo.value));
              map.getLayer('glhilite').clear();
              map.getLayer('glhilite').add(new esri.Graphic(geo, new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0, 0.5]), 2), null)));
              map.setExtent(geo.getExtent(), true);
              hideWorking();
            };
            pval = trimmed;
          }
        });
        dijit.byId('locateList').set('content', table);
      });
      hideWorking();
    });
  } catch (err) {
    eh(err, 'selectLocationType_onChange');
  }
}

function constructSearches() {
  try {
    var ddl = dijit.byId('selectLocationType');
    if (ddl) {
      ddl.destroy();
    }
    opts = [{
      value : '',
      label : '<label style="color: #FF0000">Select location type</label>'
    }];
    dojo.forEach(otherSearches, function(loc) {
      opts.push({
        value : loc.layerIndex + '|' + loc.queryField + '|' + loc.filterField,
        label : loc.displayName
      });
    });
    var sel = new dijit.form.Select({
      id : 'selectLocationType',
      name : 'selectLocationType',
      style : 'width: 99%',
      options : opts,
      onChange : function(val) {
        selectLocationType_onChange(val);
      }
    });
    dojo.byId('divLocateTop').appendChild(sel.domNode);
    sel.startup();
  } catch (err) {
    eh(err, 'constructSearches');
  }
}

function createResultArray(layerIndex, queryField, filterField, textValue, geo) {
  var qt = new esri.tasks.QueryTask(overlayMapSevice + '/' + layerIndex);
  var q = new esri.tasks.Query();
  q.returnGeometry = true;
  q.outSpatialReference = map.spatialReference;
  if (geo) {
    q.geometry = geo;
  }
  q.outFields = [queryField];
  if (filterField != '' && textValue != '') {
    q.where = queryField + " IS NOT NULL AND " + filterField + " = '" + textValue + "'";
  } else {
    q.where = queryField + ' IS NOT NULL';
  }
  q.orderByFields = [queryField + ' ASC'];
  //q.returnDistinctValues = true;
  return qt.execute(q);
}
