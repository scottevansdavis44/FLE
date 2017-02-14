;( function() {
    'use strict';

    var gaussianElimination = function(a, o) {
      var i = 0, j = 0, k = 0, maxrow = 0, tmp = 0, n = a.length - 1, x = new Array(o);
      for ( i = 0; i < n; i++) {
        maxrow = i;
        for ( j = i + 1; j < n; j++) {
          if (Math.abs(a[i][j]) > Math.abs(a[i][maxrow]))
            maxrow = j;
        }
        for ( k = i; k < n + 1; k++) {
          tmp = a[k][i];
          a[k][i] = a[k][maxrow];
          a[k][maxrow] = tmp;
        }
        for ( j = i + 1; j < n; j++) {
          for ( k = n; k >= i; k--) {
            a[k][j] -= a[k][i] * a[i][j] / a[i][i];
          }
        }
      }
      for ( j = n - 1; j >= 0; j--) {
        tmp = 0;
        for ( k = j + 1; k < n; k++)
          tmp += a[k][j] * x[k];
        x[j] = (a[n][j] - tmp) / a[j][j];
      }
      return (x);
    };

    var correlationCoefficient = function(d){
        var x=0, y=0, xy=0, x2=0, y2=0, r=0;
        for (var i = 0, len = d.length; i < len; i++) {
            x = x + d[i][0];
            y = y + d[i][1];
            xy = xy + d[i][0] * d[i][1];
            x2 = x2 + d[i][0] * d[i][0];
            y2 = y2 + d[i][1] * d[i][1];
        }
        r = ( (d.length*xy ) - (x*y) ) / Math.sqrt( ((d.length*x2) - (x*x)) * ((d.length*y2) - (y*y)) );
        return r;
        //+.70 or higher	Very strong positive relationship
        //+.40 to +.69	Strong positive relationship
        //+.30 to +.39	Moderate positive relationship
        //+.20 to +.29	weak positive relationship
        //+.01 to +.19	No or negligible relationship
        //0	No relationship
        //-.01 to -.19	No or negligible relationship
        //-.20 to -.29	weak negative relationship
        //-.30 to -.39	Moderate negative relationship
        //-.40 to -.69	Strong negative relationship
        //-.70 or higher	Very strong negative relationship
    };

    var methods = {
      linear : function(data) {
        var sum = [0, 0, 0, 0, 0], n = 0, results = [];

        for (; n < data.length; n++) {
          if (data[n][1] != null) {
            sum[0] += data[n][0];
            sum[1] += data[n][1];
            sum[2] += data[n][0] * data[n][0];
            sum[3] += data[n][0] * data[n][1];
            sum[4] += data[n][1] * data[n][1];
          }
        }

        var gradient = (n * sum[3] - sum[0] * sum[1]) / (n * sum[2] - sum[0] * sum[0]);
        var intercept = (sum[1] / n) - (gradient * sum[0]) / n;
        //  var correlation = (n * sum[3] - sum[0] * sum[1]) / Math.sqrt((n * sum[2] - sum[0] * sum[0]) * (n * sum[4] - sum[1] * sum[1]));
        var chartSeries = [];
        for (var i = 0, len = data.length; i < len; i++) {
          var coordinate = [data[i][0], data[i][0] * gradient + intercept];
          results.push(coordinate);
          chartSeries.push(coordinate[1]);
        }

        var string = 'y = ' + Math.round(gradient * 100) / 100 + 'x + ' + Math.round(intercept * 100) / 100;

        return {
          equation : [gradient, intercept],
          points : results,
          string : string,
          series : chartSeries,
          correlationCoefficient : correlationCoefficient(data),
          trendDirection: (gradient > 0) ? 'UP' : 'DOWN'
        };
      },

      linearThroughOrigin : function(data) {
        var sum = [0, 0], n = 0, results = [];

        for (; n < data.length; n++) {
          if (data[n][1] != null) {
            sum[0] += data[n][0] * data[n][0];
            //sumSqX
            sum[1] += data[n][0] * data[n][1];
            //sumXY
          }
        }

        var gradient = sum[1] / sum[0];
        var chartSeries = [];
        for (var i = 0, len = data.length; i < len; i++) {
          var coordinate = [data[i][0], data[i][0] * gradient];
          results.push(coordinate);
          chartSeries.push(coordinate[1]);
        }

        var string = 'y = ' + Math.round(gradient * 100) / 100 + 'x';

        return {
          equation : [gradient],
          points : results,
          string : string,
          series : chartSeries
        };
      },

      exponential : function(data) {
        var sum = [0, 0, 0, 0, 0, 0], n = 0, results = [];

        for ( len = data.length; n < len; n++) {
          if (data[n][1] != null) {
            sum[0] += data[n][0];
            sum[1] += data[n][1];
            sum[2] += data[n][0] * data[n][0] * data[n][1];
            sum[3] += data[n][1] * Math.log(data[n][1]);
            sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
            sum[5] += data[n][0] * data[n][1];
          }
        }

        var denominator = (sum[1] * sum[2] - sum[5] * sum[5]);
        var A = Math.pow(Math.E, (sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
        var B = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;
        var chartSeries = [];
        for (var i = 0, len = data.length; i < len; i++) {
          var coordinate = [data[i][0], A * Math.pow(Math.E, B * data[i][0])];
          results.push(coordinate);
          chartSeries.push(coordinate[1]);
        }

        var string = 'y = ' + Math.round(A * 100) / 100 + 'e^(' + Math.round(B * 100) / 100 + 'x)';

        return {
          equation : [A, B],
          points : results,
          string : string,
          series : chartSeries
        };
      },

      logarithmic : function(data) {
        var sum = [0, 0, 0, 0], n = 0, results = [];

        for ( len = data.length; n < len; n++) {
          if (data[n][1] != null) {
            sum[0] += Math.log(data[n][0]);
            sum[1] += data[n][1] * Math.log(data[n][0]);
            sum[2] += data[n][1];
            sum[3] += Math.pow(Math.log(data[n][0]), 2);
          }
        }

        var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
        var A = (sum[2] - B * sum[0]) / n;
        var chartSeries = [];
        for (var i = 0, len = data.length; i < len; i++) {
          var coordinate = [data[i][0], A + B * Math.log(data[i][0])];
          results.push(coordinate);
          chartSeries.push(coordinate[1]);
        }

        var string = 'y = ' + Math.round(A * 100) / 100 + ' + ' + Math.round(B * 100) / 100 + ' ln(x)';

        return {
          equation : [A, B],
          points : results,
          string : string,
          series : chartSeries
        };
      },

      power : function(data) {
        var sum = [0, 0, 0, 0], n = 0, results = [];

        for ( len = data.length; n < len; n++) {
          if (data[n][1] != null) {
            sum[0] += Math.log(data[n][0]);
            sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
            sum[2] += Math.log(data[n][1]);
            sum[3] += Math.pow(Math.log(data[n][0]), 2);
          }
        }

        var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
        var A = Math.pow(Math.E, (sum[2] - B * sum[0]) / n);
        var chartSeries = [];
        for (var i = 0, len = data.length; i < len; i++) {
          var coordinate = [data[i][0], A * Math.pow(data[i][0], B)];
          results.push(coordinate);
          chartSeries.push(coordinate[1]);
        }

        var string = 'y = ' + Math.round(A * 100) / 100 + 'x^' + Math.round(B * 100) / 100;

        return {
          equation : [A, B],
          points : results,
          string : string,
          series : chartSeries
        };
      },

      polynomial : function(data, order) {
        if ( typeof order == 'undefined') {
          order = 2;
        }
        var lhs = [], rhs = [], results = [], a = 0, b = 0, i = 0, k = order + 1;

        for (; i < k; i++) {
          for (var l = 0, len = data.length; l < len; l++) {
            if (data[l][1] != null) {
              a += Math.pow(data[l][0], i) * data[l][1];
            }
          }
          lhs.push(a), a = 0;
          var c = [];
          for (var j = 0; j < k; j++) {
            for (var l = 0, len = data.length; l < len; l++) {
              if (data[l][1] != null) {
                b += Math.pow(data[l][0], i + j);
              }
            }
            c.push(b), b = 0;
          }
          rhs.push(c);
        }
        rhs.push(lhs);

        var equation = gaussianElimination(rhs, k);
        var chartSeries = [];
        for (var i = 0, len = data.length; i < len; i++) {
          var answer = 0;
          for (var w = 0; w < equation.length; w++) {
            answer += equation[w] * Math.pow(data[i][0], w);
          }
          results.push([data[i][0], answer]);
          chartSeries.push(answer);
        }

        var string = 'y = ';

        for (var i = equation.length - 1; i >= 0; i--) {
          if (i > 1)
            string += Math.round(equation[i] * Math.pow(10, i)) / Math.pow(10, i) + 'x^' + i + ' + ';
          else if (i == 1)
            string += Math.round(equation[i] * 100) / 100 + 'x' + ' + ';
          else
            string += Math.round(equation[i] * 100) / 100;
        }

        return {
          equation : equation,
          points : results,
          string : string,
          series : chartSeries
        };
      },

      lastvalue : function(data) {
        var results = [];
        var lastvalue = null;
        var chartSeries = [];
        for (var i = 0; i < data.length; i++) {
          if (data[i][1]) {
            lastvalue = data[i][1];
            results.push([data[i][0], data[i][1]]);
            chartSeries.push(data[i][0]);
          } else {
            results.push([data[i][0], lastvalue]);
            chartSeries.push(data[i][0]);
          }
        }

        return {
          equation : [lastvalue],
          points : results,
          string : "" + lastvalue,
          series : chartSeries
        };
      }
    };

    var regression = (function(method, data, order) {
      if ( typeof method == 'string') {
        return methods[method](data, order);
      }
    });

    if ( typeof exports !== 'undefined') {
      module.exports = regression;
    } else {
      window.regression = regression;
    }

  }());
