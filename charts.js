/* forged dataset */
var ypts = new Array();
for (var i = 0; i <= 1000; i++) ypts.push(i * i);

(function($) {
    $.fn.invisible = function() {
        return this.each(function() {
            $(this).css("display", "none");
        });
    };
    $.fn.visible = function() {
        return this.each(function() {
            $(this).css("display", "block");
        });
    };

	$.fn.hidden = function() {
		return $(this).css("display") === "none";
	}

	$.fn.position = function(x, y) {
		$(this).css("top", y + "px");
		$(this).css("left", x + "px");
	}
}(jQuery));

var chartX, chartY;
var titleShift = 0.07;
var tabCount = 1;

$(document).ready(function () {
	chartX = $('#container').offset().left/$(window).width();
	chartY = $('#container').offset().top/$(window).height();

	$('div #cancel').click(function() {
		$('.edit').invisible();
	});

	$('#container').highcharts({
		chart: {
			borderColor: '#e8eaeb',
			borderWidth: 5,
			type: 'scatter',
			height: 0.5 * $(window).height(),
			width: 0.6 * $(window).width(),
			renderTo: 'container',
			zoomType: 'xy'
		},

		credits: {
			enabled: false
		},
	
		title: {
			useHTML: true,
			margin: 30,
			text: 'Title',
			events: {
				mouseover: function() {
					$('#edit-title').visible();
					var x = chartX * $(window).width() + this.title.x;
					var y = chartY * $(window).height() + this.title.y + 20;
					$('#edit-title').position(x, y);
					$('#new-title').val(this.options.title.text);
					$('#new-title-color').val(this.options.title.style.color);

					$('#edit-title').mouseleave(function() {
						console.log("triggered");
						$('#edit-title').invisible();
					});
				},

				mouseout: function() {
					if ($('#edit-title:hover').length === 0)
						$('#edit-title').invisible();
				}
			}
		},

		xAxis: {
			title: {
				text: 'Time (ms)',
				events: {
					mouseover: function() {
						var title = this.chart.options.xAxis[0].title;
						$('#edit-x-label').visible();
						var x = chartX * $(window).width() + this.chart.chartWidth/2.0;
						var y = chartY * $(window).height() + this.chart.chartHeight - 30;
						$('#edit-x-label').position(x, y);
						$('#new-x-label').val(this.options.title.text);
						$('#new-x-color').val(this.options.title.style.color);

						$('#edit-x-label').mouseleave(function() {
							$('#edit-x-label').invisible();
						});
					},

					mouseout: function() {
					if ($('#edit-x-label:hover').length === 0)
						$('#edit-x-label').invisible();
					}
				}
			}
		},
			
		yAxis: {
			title: {
				text: 'Count',
				events: {
					mouseover: function() {
						var title = this.chart.options.yAxis[0].title;
						$('#edit-y-label').visible();
						var x = chartX * $(window).width() + 30;
						var y = chartY * $(window).height() + this.chart.chartHeight/2.0;
						$('#edit-y-label').position(x, y);
						$('#new-y-label').val(this.options.title.text);
						$('#new-y-color').val(this.options.title.style.color);

						$('#edit-y-label').mouseleave(function() {
							$('#edit-y-label').invisible();
						});
					},

					mouseout: function() {
					if ($('#edit-y-label:hover').length === 0)
						$('#edit-y-label').invisible();
					}
				}
			}
		},

		series: [{
			id: 'Series',
			name: 'Series',
			data: ypts
		}]
	});

	var chart = $('#container').highcharts();

	chartLabelOptions(chart);
	chartDisplayOptions(chart);
	tabs(chart);
	addSeriesOptions(chart);
});

/* user options for changing axis/chart titles */
function chartLabelOptions(chart) {
	/* title settings */	
	$('#apply-title').click(function() {
		chart.setTitle({
			text: $('#new-title').val(),
			style: {
				color: $('#new-title-color').val()
			}
		});
		
		$('#edit-title').invisible();
	});

	/* x-axis settings */
	$('#apply-x-label').click(function() {
		chart.xAxis[0].setTitle({
			text: $('#new-x-label').val(),
			style: {
				color: $('#new-x-color').val()
			}
		});

		$('#edit-x-label').invisible();
	});

	/* y-axis settings */
	$('#apply-y-label').click(function() {
		chart.yAxis[0].setTitle({
			text: $('#new-y-label').val(),
			style: {
				color: $('#new-y-color').val()
			}
		});

		$('#edit-y-label').invisible();
	});
}

/* user options for changing plot range/display */
function chartDisplayOptions(chart) {
	/* plot options */
	var xAxis = chart.xAxis[0];
	var yAxis = chart.yAxis[0];

	$('#x-min').val(xAxis.min);
	$('#x-max').val(xAxis.max);
	$('#y-min').val(yAxis.min);
	$('#y-max').val(yAxis.max);
	$('#chart-height').val(chart.chartHeight/$(window).height() * 100);
	$('#chart-width').val(chart.chartWidth/$(window).width() * 100);

	/* handle input changes */
	$('.plot-range').change(function() {
		xAxis.update({
			floor: $('#x-min').val(),
			ceiling: $('#x-max').val()
		});
		yAxis.update({
			floor: $('#y-min').val(),
			ceiling: $('#y-max').val() 
		});
		xAxis.setExtremes($('#x-min').val(), $('#x-max').val());
		yAxis.setExtremes($('#y-min').val(), $('#y-max').val());
	});

	$('.chart-range').change(function() {
		var newWidth = $('#chart-width').val()/100.0 * $(window).width();
		var newHeight = $('#chart-height').val()/100.0 * $(window).height();
		chart.setSize(newWidth, newHeight);

		var p = $('#chart-width').val();
		$('#container').css("width", p + "%");
		$('#container').css("margin-left", (100 - p)/2 + "%");
	});

	$('#chart-color').change(function() {
		chart.chartBackground.css({
			color: $('#chart-color').val()
		});
	});
}

function tabs(chart) {
	$('#tabs a.tab').live('click', function() {
		if ($(this).parent().hasClass("current"))	{
			chartY -= titleShift;
			$(this).parent().removeClass("current");
			$('.tab-content').invisible();
			return;
		}

		chartY += titleShift;
		// hide all other tabs
		$("#tabs li").removeClass("current");
		$(this).parent().addClass("current");

		if ($(this).attr("id") === "add-series") {
			$('#edit-series-tab').invisible();
			$('#add-series-tab').visible();
		} else {
			$('#add-series-tab').invisible();
			$('#edit-series-tab').visible();
			updateSeriesOptions($(this).attr("name"), chart);
		}
	});

	$('#tabs a.remove').live('click', function() {
		// confirm deletion (NI)

		// Get the tab name
		var tabid = $(this).parent().find(".tab").attr("id");

		// remove tab and related content
		$(this).parent().remove();
		$('#update-series-tab').invisible();

		// if there is no current tab and if there are still tabs left, show the first one
			if ($("#tabs li.current").length == 0 && $("#tabs li").length > 0) {

			// find the first tab    
			var firsttab = $("#add-series");
			firsttab.addClass("current");
		}
	});
}

function updateSeriesOptions(seriesName, chart) {
	var series = chart.get(seriesName);
	$('#edit-series-tab #series-name').val(seriesName);
	$("#edit-series-tab #series-color").val(series.color);
	$("#edit-series-tab #series-color").spectrum({
		color: series.color
	});

	$('#edit-series-tab #update').click(function() {
		var newName = $('#edit-series-tab #series-name').val();
		var newColor = $('#edit-series-tab #series-color').val();

		series.update({
			id: newName,
			name: newName,
			color: newColor
		});

		var curTab = $('[class="tab"][name="' + seriesName + '"]');
		curTab.attr('name', newName)
			.text(newName);
		console.log($('#tabs'));
	});
}

function addSeriesOptions(chart) {
	$('#add-series-tab #submit').click(function() {
		var seriesName = $('#add-series-tab #series-name').val();
		if (seriesName.length === 0) {
			alert("No name entered.");
			return;
		}

		var seriesColor = $('#add-series-tab #series-color').val();
		var seriesData = parseData($('#add-series-tab #series-data').val());

		if (seriesData.length === 0) {
			alert("Invalid data.");
			return;
		}

		chart.addSeries({
			id: seriesName,
			name: seriesName,
			data: seriesData,
			color: seriesColor
		});

		tabCount++;

		var newTab = $('<li>')
			.append($('<a>')
				.addClass('tab')
				.attr('id', 'tab-' + tabCount)
				.attr('name', seriesName)
				.append(seriesName))
			.append($('<a>')
				.attr('href', '#')
				.addClass('remove')
				.append('x'));

		$('#tabs').append(newTab);
		$('#add-series-tab *').val('');
		$('li.current').removeClass("current");
		$('.tab-content').invisible();
	});
}

/* aux functions */
function parseData(str) {
	var strArr = str.split('\n');
	var series = new Array();	
	for (var i = 0; i < strArr.length; i++) {
		var xyStr = strArr[i].split(',');
		var x = parseInt(xyStr[0]);
		var y = parseInt(xyStr[1]);
		console.log(xyStr);
		if (isNaN(x) || isNaN(y)) return [];
		series.push(new Array(x, y));
	}
	return series;
}
