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

var chart;
var origSeries; // determined in plot-main.js
var dataMax, dataMin, binCount, binSize;

$(window).load(function () {
	initChart();
	initLabelOptions();
	chartDisplayOptions();
	initResizable();
});

/*********************************************
	initial settings
********************************************/
// from plot-main.js
function initResizable() {
	$('#settings-panel').resizable({
		handles: 'e',
		resize: function(event, ui) {
			var widthPct = 99.0 - 100.0 * ui.size.width/$(window).width();
			$('#chart-container').css({ 'width': widthPct + '%' });

			chart.setSize($('#chart').width() - 20,
				$('#chart').height() - 20, false);
		}
	});
	$('#chart-settings').resizable({ handles: 's' });

	$('#chart').resizable({
		handles: 'se',
		resize: function() {
			var width = this.offsetWidth - 20;
			var height = this.offsetHeight - 20;

			chart.setSize(width, height, false);

			var marginWidth = 50 - (50.0 * width / $('#chart-container').width());
			$(this).css({ 'margin-left': marginWidth + '%' });
		}
	});
}

function initChart() {
	initChartOptions();
	initHistOptions();
	updateCategories();
	updateSeries();
}

function initChartOptions() {
	chart = new Highcharts.Chart({
		chart: {
			renderTo: 'chart',
			type: 'column',			
			zoomType: 'xy'
		},
		credits: { enabled: false },
		title: {
			useHTML: true,
			margin: 30,
			text: 'Reaction Data',
			events: {
				click: function() {
					showLabelOptions(this, $('#edit-title'), this.title.x, this.title.y);
				}
			},
			style: {
				fontFamily: 'Lucida Grande',
				fontSize: '18px'
			}
		},

		xAxis: {
			labels: {
				style: { fontSize: '12px', fontFamily: 'Lucida Grande' }
			},
			title: {
				events: {
					click: function() {
						showLabelOptions(this, $('#edit-x-label'), this.chart.chartWidth/2.0, this.chart.chartHeight - 60);
					}
				},

				style: { fontSize: '12px', fontFamily: 'Lucida Grande' }
			}
		},
			
		yAxis: {
			labels: {
				style: { fontSize: '12px', fontFamily: 'Lucida Grande' }
			},
			title: {
				events: {
					click: function() {
						showLabelOptions(this, $('#edit-y-label'), 20, this.chart.chartHeight/2.0 - 20);
					}
				},

				style: { fontSize: '12px', fontFamily: 'Lucida Grande' }
			}
		}
	});
}

function initHistOptions() {
	dataMax = dataMin = null;
	$.each(origSeries, function(_, series) {
		$.each(series.data, function(_, pt) {
			if (dataMax === null) {
				dataMax = dataMin = pt.y;
			} else {
				dataMin = Math.min(dataMin, pt.y);
				dataMax = Math.max(dataMax, pt.y);
			}
		});
	});

	binCount = 10;
	binSize = Math.floor((dataMax - dataMin)/binCount) + 1;
}

function updateCategories() {
	var categories = new Array();
	for (var i = 0; i < binCount; i++) {
		var xMin = dataMin + i * binSize;
		var xMax = Math.min(xMin + binSize - 1, dataMax);
		categories.push(xMin + " - " + xMax);
	}
	chart.xAxis[0].setCategories(categories);
}

function updateHistOptions() {
	binSize = Math.floor((dataMax - dataMin)/binCount) + 1;
}

function updateSeries() {
	$.each(origSeries, function(_, series) {
		var seriesData = new Array();
		for (var i = 0; i < binCount; i++) seriesData.push(0);
		$.each(series.data, function(_, pt) {
			var binIndex = Math.floor((pt.y - dataMin)/binSize);
			seriesData[binIndex]++;
		});

		if (chart.get(series.name)) {
			chart.get(series.name).update({ data: seriesData });
		} else {
			chart.addSeries({
				id: series.name,
				name: series.name,
				data: seriesData
			});
		}
	});
}

/****************************************************
	various chart display functions follow
	most of it is copied from plot-main.js for now
*****************************************************/

/* display label edit options
 * labelElem: element containing label
 * editElem: element containing edit options
 */
function showLabelOptions(labelElem, editElem, offsetX, offsetY) {
	editElem.visible();
	var pos = $('#chart').offset();
	var x = pos.left + offsetX;
	var y = pos.top + offsetY;
	editElem.position(x, y);
	editElem.children('.label-text')
		.val(labelElem.options.title.text);
	editElem.children('.label-color')
		.val(labelElem.options.title.style.color);
	editElem.children('.label-size')
		.val(parseInt(labelElem.options.title.style.fontSize));
	editElem.children('.label-font')
		.val(labelElem.options.title.style.fontFamily);

	// axis only
	if ((editElem.children('.tick-interval')).length) {
		editElem.children('.tick-interval')
			.val(labelElem.tickInterval);
	}
}

function getLabelElem(eName) {
	switch (eName) {
		case "edit-title": return chart;
		case "edit-x-label": return chart.xAxis[0];
		case "edit-y-label": return chart.yAxis[0]; 
		default: alert("error");
	}
}

/* user options for changing axis/chart titles
 * edit options displayed on label mouseover and
 * hidden on cancel/chart/apply click
 */
function initFonts() {
	var fontList = ['Times New Roman', 'Arial', 'Helvetica', 'Arial Black', 'Comic Sans MS', 'Lucida Grande', 'Tahoma', 'Geneva', 'Verdana', 'Courier New'];

	for (var i = 0; i < fontList.length; i++) {
		$('.edit-label .label-font').append($('<option>')
			.append(fontList[i])
			.attr("name", fontList[i]));
	}
}

function applyLabel() {
	var parent = $(this).parent();
	var labelElem = getLabelElem(parent.attr("id"));
	
	var newStyle = {
		color: parent.children('.label-color').val(),
		fontSize: parent.children('.label-size').val() + 'px',
		fontFamily: parent.children('.label-font').val()
	};

	labelElem.setTitle({
		text: parent.children('.label-text').val(),
		style: newStyle
	});

	if (parent.attr("id") !== "edit-title") {
		labelElem.update({
			labels: { style: newStyle },
			tickInterval: parseFloat(parent.children('.tick-interval').val())
		});
	}

	$('.edit-label').invisible();
}

function initLabelOptions() {
	$('.cancel').click(function() {
		$('.edit-label').invisible();
	});

	$('.label-color').spectrum({
		showInput: true,
		preferredFormat: 'hex'
	});

	initFonts();

	$('.apply-label').click(applyLabel);
}

/* user options for changing plot range/display */
function chartDisplayOptions() {
	var curBackground = chart.options.chart.backgroundColor;

	$('#chart-color').spectrum({
		color: curBackground,
		showInput: true,
		preferredFormat: 'hex'
	});

	$('#chart-color').val(curBackground);
	$('#chart-color').change(function() {
		chart.chartBackground.css({
			color: $('#chart-color').val()
		});
		$('#chart').css("background", $('#chart-color').val());
	});

	$('#toggle-legend').click(function() {
		var e = $('#toggle-legend');
		if (e.prop("checked"))
			$('.highcharts-legend').visible();
		else
			$('.highcharts-legend').invisible();
	});

	$('#bin-count').val(binCount);
	$('#bin-count').change(function() {
		binCount = $('#bin-count').val();
		updateHistOptions();
		updateCategories();
		updateSeries();
	});
}
