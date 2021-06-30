var breakCards = true;

var searchVisible = 0;
var transparent = true;

var transparentDemo = true;
var fixedTop = false;

var mobile_menu_visible = 0,
  mobile_menu_initialized = false,
  toggle_initialized = false,
  bootstrap_nav_initialized = false;

var seq = 0,
  delays = 80,
  durations = 500;
var seq2 = 0,
  delays2 = 80,
  durations2 = 500;
function drawMap(sCount, nsCount) {
  var dataSetMap = google.visualization.arrayToDataTable(sCount);
  var ndataSetMap = google.visualization.arrayToDataTable(nsCount);
  let d = google.visualization.data.group(
    dataSetMap,
    [0],
    [
      {
        column: 1,
        aggregation: google.visualization.data.sum,
        type: "number",
      },
    ]
  );
  let nd = google.visualization.data.group(
    ndataSetMap,
    [0],
    [
      {
        column: 1,
        aggregation: google.visualization.data.sum,
        type: "number",
      },
    ]
  );
  var optionMap = {
    colorAxis: {
      colors: ["white", "pink", "red"],
    },
    backgroundColor: "#99ccff",
    datalessRegionColor: "#ffffcc",
    defaultColor: "#f5f5f5",
  };
  var noptionMap = {
    colorAxis: {
      colors: ["#ffffff", "#99cc00", "#009933"],
    },
    backgroundColor: "#99ccff",
    datalessRegionColor: "#ffffcc",
    defaultColor: "#f5f5f5",
  };
  var suicidalMap = new google.visualization.GeoChart(
    document.getElementById("suicidalMap")
  );
  var nsuicidalMap = new google.visualization.GeoChart(
    document.getElementById("nsuicidalMap")
  );
  suicidalMap.draw(d, optionMap);
  nsuicidalMap.draw(nd, noptionMap);
}
md = {
  misc: {
    navbar_menu_visible: 0,
    active_collapse: true,
    disabled_collapse_init: 0,
  },
  initDashboardPageCharts: function (
    week,
    nweek,
    retweet,
    nretweet,
    count,
    time,
    sCount,
    ntime,
    nsCount
  ) {
    console.log(time);

    if (
      $("#dailySalesChart").length != 0 ||
      $("#completedTasksChart").length != 0 ||
      $("#websiteViewsChart").length != 0
    ) {
      dataDailySalesChart = {
        labels: ["M", "T", "W", "T", "F", "S", "S"],
        series: [week],
      };
      ndataDailySalesChart = {
        labels: ["M", "T", "W", "T", "F", "S", "S"],
        series: [nweek],
      };
      optionsDailySalesChart = {
        lineSmooth: Chartist.Interpolation.cardinal({
          tension: 0,
        }),
        low: 0,
        high: Math.max.apply(Math, week),
        chartPadding: {
          top: 20,
          right: 0,
          bottom: 0,
          left: 0,
        },
      };
      noptionsDailySalesChart = {
        lineSmooth: Chartist.Interpolation.cardinal({
          tension: 0,
        }),
        low: 0,
        high: Math.max.apply(Math, nweek),
        chartPadding: {
          top: 20,
          right: 0,
          bottom: 0,
          left: 0,
        },
      };

      var dailySalesChart = new Chartist.Line(
        "#dailySalesChart",
        dataDailySalesChart,
        optionsDailySalesChart
      );
      var ndailySalesChart = new Chartist.Line(
        "#ndailySalesChart",
        ndataDailySalesChart,
        noptionsDailySalesChart
      );

      md.startAnimationForLineChart(dailySalesChart);
      md.startAnimationForLineChart(ndailySalesChart);

      var chart = new Chartist.Pie(
        "#retweets",
        {
          series: count,
          labels: ["Suicidal", "Non-suicidal"],
        },
        {
          donut: true,
          showLabel: false,
        }
      );

      chart.on("draw", function (data) {
        if (data.type === "slice") {
          var pathLength = data.element._node.getTotalLength();
          data.element.attr({
            "stroke-dasharray": pathLength + "px " + pathLength + "px",
          });
          var animationDefinition = {
            "stroke-dashoffset": {
              id: "anim" + data.index,
              dur: 1000,
              from: -pathLength + "px",
              to: "0px",
              easing: Chartist.Svg.Easing.easeOutQuint,
              fill: "freeze",
            },
          };
          if (data.index !== 0) {
            animationDefinition["stroke-dashoffset"].begin =
              "anim" + (data.index - 1) + ".end";
          }
          data.element.attr({
            "stroke-dashoffset": -pathLength + "px",
          });
          data.element.animate(animationDefinition, false);
        }
      });
      var ncount = [count[0] - 30, count[1] - 10];
      var nchart = new Chartist.Pie(
        "#sentence",
        {
          series: ncount,
          labels: ["Suicidal", "Non-suicidal"],
        },
        {
          donut: true,
          showLabel: false,
        }
      );

      nchart.on("draw", function (data) {
        if (data.type === "slice") {
          var pathLength = data.element._node.getTotalLength();
          data.element.attr({
            "stroke-dasharray": pathLength + "px " + pathLength + "px",
          });
          var animationDefinition = {
            "stroke-dashoffset": {
              id: "anim" + data.index,
              dur: 1000,
              from: -pathLength + "px",
              to: "0px",
              easing: Chartist.Svg.Easing.easeOutQuint,
              fill: "freeze",
            },
          };
          if (data.index !== 0) {
            animationDefinition["stroke-dashoffset"].begin =
              "anim" + (data.index - 1) + ".end";
          }
          data.element.attr({
            "stroke-dashoffset": -pathLength + "px",
          });
          data.element.animate(animationDefinition, false);
        }
      });

      /* ----------=========      Time vs suicidal tweets =======------------*/
      optionsTimeChart = {
        lineSmooth: Chartist.Interpolation.cardinal({
          tension: 0,
        }),
        low: 0,
        high: Math.max.apply(Math, time),
        chartPadding: {
          top: 20,
          right: 0,
          bottom: 0,
          left: 0,
        },
      };
      var timeChart = new Chartist.Line(
        "#time",
        {
          labels: [
            "0 AM",
            "1 AM",
            "2 AM",
            "3 AM",
            "4 AM",
            "5 AM",
            "6 AM",
            "7 AM",
            "8 AM",
            "9 AM",
            "10 AM",
            "11 AM",
            "12 PM",
            "1 PM",
            "2 PM",
            "3 PM",
            "4 PM",
            "5 PM",
            "6 PM",
            "7 PM",
            "8 PM",
            "9 PM",
            "10 PM",
            "11 PM",
          ],
          series: [time],
        },
        optionsTimeChart
      );
      md.startAnimationForLineChart(timeChart);

      noptionsTimeChart = {
        lineSmooth: Chartist.Interpolation.cardinal({
          tension: 0,
        }),
        low: 0,
        high: Math.max.apply(Math, ntime),
        chartPadding: {
          top: 20,
          right: 0,
          bottom: 0,
          left: 0,
        },
      };
      var ntimeChart = new Chartist.Line(
        "#ntime",
        {
          labels: [
            "0 AM",
            "1 AM",
            "2 AM",
            "3 AM",
            "4 AM",
            "5 AM",
            "6 AM",
            "7 AM",
            "8 AM",
            "9 AM",
            "10 AM",
            "11 AM",
            "12 PM",
            "1 PM",
            "2 PM",
            "3 PM",
            "4 PM",
            "5 PM",
            "6 PM",
            "7 PM",
            "8 PM",
            "9 PM",
            "10 PM",
            "11 PM",
          ],
          series: [ntime],
        },
        noptionsTimeChart
      );
      md.startAnimationForLineChart(ntimeChart);

      /* ----------==========     Completed Tasks Chart initialization    ==========---------- */

      dataCompletedTasksChart = {
        labels: ["<10", "<50 and >10", "<100 and >50", ">100"],
        series: [retweet],
      };
      ndataCompletedTasksChart = {
        labels: ["<10", "<50 and >10", "<100 and >50", ">100"],
        series: [nretweet],
      };
      var optionsWebsiteViewsChart = {
        axisX: {
          showGrid: false,
        },
        low: 0,
        high: Math.max.apply(Math, retweet),
        chartPadding: {
          top: 20,
          right: 5,
          bottom: 0,
          left: 0,
        },
      };
      var noptionsWebsiteViewsChart = {
        axisX: {
          showGrid: false,
        },
        low: 0,
        high: Math.max.apply(Math, nretweet),
        chartPadding: {
          top: 20,
          right: 5,
          bottom: 0,
          left: 0,
        },
      };
      var responsiveOptions = [
        [
          "screen and (max-width: 640px)",
          {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              },
            },
          },
        ],
      ];
      var websiteViewsChart = Chartist.Bar(
        "#completedTasksChart",
        dataCompletedTasksChart,
        optionsWebsiteViewsChart,
        responsiveOptions
      );
      var nwebsiteViewsChart = Chartist.Bar(
        "#ncompletedTasksChart",
        ndataCompletedTasksChart,
        noptionsWebsiteViewsChart,
        responsiveOptions
      );
      md.startAnimationForBarChart(websiteViewsChart);
      md.startAnimationForBarChart(nwebsiteViewsChart);
    }

    /* ----------==========     Suicidal map    ==========---------- */
    $.getScript("https://www.google.com/jsapi")
      .done(function (script, textStatus) {
        google.load("visualization", "1", {
          package: ["corechart"],
          callback: drawMap(sCount, nsCount),
        });
      })
      .fail(function (jqxhr, settings, exeption) {
        alert("Loading failed");
      });
  },

  startAnimationForLineChart: function (chart) {
    chart.on("draw", function (data) {
      if (data.type === "line" || data.type === "area") {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path
              .clone()
              .scale(1, 0)
              .translate(0, data.chartRect.height())
              .stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint,
          },
        });
      } else if (data.type === "point") {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: "ease",
          },
        });
      }
    });

    seq = 0;
  },
  startAnimationForBarChart: function (chart) {
    chart.on("draw", function (data) {
      if (data.type === "bar") {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: "ease",
          },
        });
      }
    });

    seq2 = 0;
  },
};

$(".filter-button").click(function () {
  var value = $(this).attr("data-filter");
  if (value == "all") {
    $(".filter").show(1000);
  } else {
    $(".filter")
      .not("." + value)
      .hide(1000);
    $(".filter")
      .filter("." + value)
      .show(1000);
  }
});
