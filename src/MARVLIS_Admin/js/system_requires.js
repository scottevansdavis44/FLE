require(['dojo/parser', 'dojo/_base/event', 'dojo/ready', 'dojo/dom', 'dojo/window', 'dojo/_base/array', 'esri/urlUtils', 'esri/tasks/locator', 'esri/map', 'esri/dijit/HomeButton',
'esri/dijit/LocateButton', 'esri/layers/FeatureLayer', 'esri/tasks/query', 'esri/layers/LabelLayer', 'esri/dijit/Popup', 'esri/layers/LabelClass', 'esri/symbols/SimpleFillSymbol', 'esri/tasks/ProjectParameters',
'esri/symbols/TextSymbol', 'esri/renderers/UniqueValueRenderer', 'esri/renderers/ClassBreaksRenderer', 'esri/renderers/HeatmapRenderer', 'esri/layers/StreamLayer', 'esri/layers/GraphicsLayer',
'esri/symbols/PictureMarkerSymbol', 'esri/tasks/query', 'esri/tasks/geometry', 'dojo/promise/all', 'dojo/DeferredList', 'dojo/Deferred', 'dojo/date/locale', 'dojo/_base/json', 'dijit/registry',
'dijit/popup', 'dijit/Dialog', 'dijit/Tooltip', 'dijit/form/Button', 'dijit/form/DropDownButton', 'dijit/layout/BorderContainer', 'dijit/layout/ContentPane',
'dijit/layout/LayoutContainer', 'dijit/form/TextBox', 'dijit/form/Select', 'dojo/cookie', 'dojox/lang/functional', 'dojox/lang/functional/lambda',
'dojox/lang/functional/curry', 'dojox/lang/functional/fold',
'dojox/charting/Chart', 'dojox/charting/plot2d/Pie', 'dojox/charting/plot2d/Columns', 'dojox/charting/plot2d/Lines',
'dojox/charting/action2d/Magnify', 'dojox/charting/themes/Chris', 'dojox/charting/themes/Tom', 'dojox/charting/themes/Claro',
'dojox/charting/themes/Electric', 'dojox/charting/DataChart', 'dojox/charting/action2d/Highlight', 'dojox/charting/action2d/Tooltip',
'dojox/charting/action2d/MoveSlice', 'dojox/charting/widget/Legend', 'dojox/gfx/gradutils',
'dojox/charting/widget/SelectableLegend', 'dojox/layout/GridContainerLite', 'dijit/TitlePane'], function (parser, event, ready, dom, win) {
    ready(function () {
        parser.parse();
        var vs = win.getBox();
        //alert(vs.h + ' ' + vs.w);
        if (vs.h > vs.w) {
            document.getElementsByTagName('body')[0].style.transform = "rotate(90deg)";
        } else {
            document.getElementsByTagName('body')[0].style.transform = "none";
        }
        var supportsOrientationChange = 'onorientationchange' in window, orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';
        window.addEventListener(orientationEvent, function (evt) {
            log('Orientation changed: ' + window.orientation);
            var vs = win.getBox();
            //alert(vs.h + ' ' + vs.w);
            if (vs.h > vs.w) {
                document.getElementsByTagName('body')[0].style.transform = "rotate(90deg)";
            } else {
                document.getElementsByTagName('body')[0].style.transform = "none";
            }
            var gc1 = dijit.byId('GC1');
            dijit.byId('divMainContainer').resize();
            dijit.byId('divMainContainer').layout();
            dijit.byId('GC1').resize({ w: gc1.w, h: gc1.h });
            dijit.byId('GC1').layout();
            dijit.byId('chartPie').resize();
            dijit.byId('Main52Weeks').resize();
            dijit.byId('MainHeatTable').resize();
            //dijit.byId('chart5').resize();
            if (chartDayTime) { chartDayTime.resize(); }
            if (chartPie) { chartPie.resize(); }
            if (chartPieLegend) { chartPieLegend.refresh(); }
            if (linesColumns) { linesColumns.resize(); }
            //clearTimeout(resizeTimer);
            if (mapChart) {
                mapChart.infoWindow.hide();
                mapChart.reposition();
                mapChart.resize();
            }
            if (mapClassBreak) {
                mapClassBreak.infoWindow.hide();
                mapClassBreak.reposition();
                mapClassBreak.resize();
            }
            //            resizeTimer = setTimeout(function () {
            //                if (mapChart) {
            //                    mapChart.infoWindow.hide();
            //                    mapChart.reposition();
            //                    mapChart.resize();
            //                    clearTimeout(resizeTimer);
            //                }
            //            }, 500);
        }, false);
        if (dojo.isIE < 10) {
            window.location = 'ie8.htm';
            return;
        } else {
            showWorking('loading ...');
            var vs = win.getBox();
            smallWin = (vs.w < 1200);
            if (smallWin) {
                swapStyleSheet('summary_css', 'css/summary_small.css');
            }
            //            require(['dojo/has', 'dojo/_base/sniff'], function (has) {
            //                if (has('chrome') || has('ie')) {
            //                    swapStyleSheet('togglebuttons_css', 'css/togglebuttons_other.css');
            //                }
            //            });

            getVars().then(function (rtn) {
                loadTypes(rtn);
                setTimeout(function () { tick(); }, 60000);
            }, function (err) {
                log('ERROR: ' + err.message);
            });

            //            window.onresize = function (event) {
            //                dijit.byId('GC1').resize();
            //                dijit.byId('GC1').layout();
            //                dijit.byId('chartPie').resize();
            //                dijit.byId('chartLast52Weeks').resize();
            //                dijit.byId('heatTable').resize();
            //                dijit.byId('chart5').resize();
            //                chartDayTime.resize();
            //                chartPie.resize();
            //                chartPieLegend.refresh();
            //                linesColumns.resize();
            //                clearTimeout(resizeTimer);
            //                resizeTimer = setTimeout(function () {
            //                    if (mapChart) {
            //                        mapChart.infoWindow.hide();
            //                        mapChart.reposition();
            //                        mapChart.resize();
            //                        clearTimeout(resizeTimer);
            //                    }
            //                }, 500);
            //            };
        }
    });
});
