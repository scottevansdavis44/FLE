var gridOne = null;
var theStore = null;
var theLayout = [];

function clearTables() {
  try {
    if (gridOne) {
      gridOne.destroy();
      gridOne = null;
    }
  } catch (err) {
    eh(err, 'clearTables');
  }
}

function createTable(layer, sector, evntField, layerIndex, queryField) {
  try {
    clearTables();
    var fieldNames = findCrimeGroupFieldNames(layer.name);
    var dateField = findCrimeGroupDateFieldName(layer.name);
    var agrp = findCrimeGroup(layer.name);
    if (agrp.processSummaryCounts.FieldOrOverlay == 'field' || sector == 'ALL') {
      var q = new esri.tasks.Query();
      q.returnGeometry = false;
      q.outFields = fieldNames;
      q.where = (sector == 'ALL') ? '1=1' : evntField + " = '" + sector + "'";
      q.orderByFields = [dateField + ' ASC'];
      layer.queryFeatures(q, function(rtn) {
        finishGrid(rtn.features, fieldNames, dateField, agrp, layer);
      }, function(err) {
        eh(err, 'createTable_queryFeatures');
      });
    } else {
      var qt = new esri.tasks.QueryTask(overlayMapSevice + '/' + layerIndex);
      var q = new esri.tasks.Query();
      q.returnGeometry = true;
      q.outSpatialReference = layer.spatialReference;
      q.where = queryField + " = '" + sector + "'";
      return qt.execute(q, function(rtn) {
        var nq = new esri.tasks.Query();
        nq.returnGeometry = false;
        nq.outFields = fieldNames;
        nq.geometry = rtn.features[0].geometry;
        nq.where = '1=1';
        nq.orderByFields = [dateField + ' ASC'];
        nq.spatialRelationship = esri.tasks.Query.SPATIAL_REL_CONTAINS;
        layer.queryFeatures(nq, function(rtns) {
          finishGrid(rtns.features, fieldNames, dateField, agrp, layer);
        }, function(err) {
          eh(err, 'createTable_queryFeatures');
        });
      });
    }
  } catch (err) {
    eh(err, 'createTable');
  }
}

function finishGrid(features, fieldNames, dateField, agrp, layer) {
  try {
    var items = dojo.map(features, function(feature) {
      return feature.attributes;
    });
    theStore = new dojo.data.ItemFileReadStore({
      data : {
        items : items
      }
    });
    theStore.comparatorMap = {};
    theLayout = [];
    dateIndex = -1;
    dojo.forEach(fieldNames, function(fName, n) {
      var currentField = getField(layer, fName);
      if (fName == dateField) {
        dateIndex = n;
      }
      switch (currentField.type) {
      case 'esriFieldTypeSmallInteger':
      case 'esriFieldTypeInteger':
      case 'esriFieldTypeSingle':
      case 'esriFieldTypeDouble':
        theLayout.push({
          field : fName,
          name : currentField.alias,
          datatype : 'number',
          width : fName.length * 10 + 'px',
          styles : 'text-align: right;',
          formatter : formatNumber,
          hidden : false
        });
        break;
      case 'esriFieldTypeDate':
        theLayout.push({
          field : fName,
          name : currentField.alias,
          datatype : 'date',
          width : '130px',
          formatter : formatDate,
          hidden : false
        });
        break;
      default:
        theLayout.push({
          field : fName,
          name : currentField.alias,
          datatype : 'string',
          width : currentField.length * 10 + 'px',
          formatter : formatString,
          hidden : false
        });
      }
    });
    var layout = [{
      defaultCell : {},
      cells : theLayout
    }];
    theStore.comparatorMap['BCS_DOW'] = function(a, b) {
      var enumMap = {
        Sunday : 1,
        Monday : 2,
        Tuesday : 3,
        Wednesday : 4,
        Thursday : 5,
        Friday : 6,
        Saturday : 7
      };
      return (enumMap[a] > enumMap[b]) ? 1 : -1;
    };
    // create a new grid:
    gridOne = new dojox.grid.EnhancedGrid({
      id : 'tableOne',
      selectionMode : 'single',
      rowSelector : '1px',
      structure : layout,
      store : null,
      plugins : {
        nestedSorting : true,
        indirectSelection : false
      },
      loadingMessage : 'Getting data from server..',
      errorMessage : 'Oops we could not retrive the requested data!',
      onFetchError : function(error, ioargs) {
        console.log('Error ocured: ' + error + ' ioargs: ' + ioargs);
        return true;
      },
      onStyleRow : function(row) {
        if (agrp.eventServiceOpenCloseField.name != '') {
          statusfield = agrp.eventServiceOpenCloseField.name;
          var item = gridOne.getItem(row.index);
          if (item) {
            itemValue = item[statusfield];
            if (agrp.eventServiceOpenCloseField.open.indexOf(itemValue[0]) > -1) {
              row.customStyles += 'color: #005108; font-weight: bold;';
              //green
            } else if (agrp.eventServiceOpenCloseField.closed.indexOf(itemValue[0]) > -1) {
              row.customStyles += 'color: #AF0000; font-weight: bold;';
              //red
            } else {
              row.customStyles += 'color: black; font-weight: bold;';
            }
          }
          gridOne.focus.styleRow(row);
          gridOne.edit.styleRow(row);
        }
      }
    });
    dijit.byId('dialogTable').set('title', layer.name + ' (' + features.length + ')');
    dijit.byId('dialogTable').show();
    dojo.byId('divTableBody').appendChild(gridOne.domNode);
    gridOne.startup();
    gridOne.setStore(theStore);
    gridOne.setSortIndex(dateIndex, true);
  } catch (err) {
    eh(err, 'finishGrid');
  }
}

function findCrimeGroup(name) {
  agrp = null;
  dojo.forEach(dataConfig, function(dc) {
    dojo.forEach(dc.eventServiceCrimeGroups, function(grp) {
      if (grp.label === name) {
        agrp = dc;
      }
    });
  });
  return agrp;
}

function findCrimeGroupDateFieldName(name) {
  field = '';
  dojo.forEach(dataConfig, function(dc) {
    dojo.forEach(dc.eventServiceCrimeGroups, function(grp) {
      if (grp.label === name) {
        field = grp.dateFieldName;
      }
    });
  });
  return field;
}

function findCrimeGroupFieldNames(name) {
  fields = '';
  dojo.forEach(dataConfig, function(dc) {
    dojo.forEach(dc.eventServiceCrimeGroups, function(grp) {
      if (grp.label === name) {
        fields = grp.tableFields;
      }
    });
  });
  return fields.split(',');
}

function getField(fLayer, fldname) {
  filteredArr = dojo.filter(fLayer.fields, function(item) {
    return item.name == fldname;
  });
  return filteredArr[0];
}

function formatNumber(value) {
  return (value == null || value == 'null' || value == '') ? '<font color="#C0C0C0"><em>0</em></font>' : value;
}

function formatString(value) {
  return (value == null || value == 'null' || value == '') ? 'null' : value;
}

function formatDate(value) {
  if (value == null || value == 'null' || value == '') {
    return 'null';
  } else {
    var inputDate = new Date(value);
    return dojo.date.locale.format(dojo.date.add(inputDate, 'minute', inputDate.getTimezoneOffset()), {
      selector : 'date',
      datePattern : 'yyyy-MM-dd HH:mm:ss'
    });
  }
}
