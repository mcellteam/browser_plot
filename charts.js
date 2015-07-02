var dataDir = "test_sim/abc_files/mcell/react_data/seed_00001";
var fileList = ["a.World.dat", "b.World.dat"];

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

var chart; // global chart
var spectrumVisible = false; // true iff mouseover color inputs visible

$(document).ready(function () {
	initChart();

	chart = $('#chart').highcharts();
	changeLabelOptions();
	chartDisplayOptions();
	initResizable();
	initSeries();
});

/* show title/x-label/y-label options on mouseover */
function showLabelOptions(labelElem, editElem, newLabelElem, newColorElem, offsetX, offsetY) {
	editElem.visible();
	var pos = $('#chart').offset();
	var x = pos.left + offsetX;
	var y = pos.top + offsetY;
	editElem.position(x, y);
	newLabelElem.val(labelElem.options.title.text);
	newColorElem.val(labelElem.options.title.style.color);
}

/* initial Highcharts settings */
function initChart() {
	$('#chart').highcharts({
		chart: {
			events: {
				click: function(event) {
					$('.edit').invisible();
				}
			},
			type: 'scatter',
			zoomType: 'xy'
		},
		credits: { enabled: false },
		title: {
			useHTML: true,
			margin: 30,
			text: 'Title',
			events: {
				mouseover: function() {
					showLabelOptions(this, $('#edit-title'), $('#new-title'), $('#new-color'), this.title.x, this.title.y);
				}
			}
		},

		xAxis: {
			events: {
				afterSetExtremes: function(e) {
					$('#x-min').val(this.min);
					$('#x-max').val(this.max);
				}
			},
			title: {
				text: 'Time (ms)',
				events: {
					mouseover: function() {
						showLabelOptions(this, $('#edit-x-label'), $('#new-x-label'), $('#new-x-color'), this.chart.chartWidth/2.0, this.chart.chartHeight - 60);
					}
				}
			}
		},
			
		yAxis: {
			events: {
				afterSetExtremes: function(e) {
					$('#y-min').val(this.min);
					$('#y-max').val(this.max);
				}
			},
			title: {
				text: 'Count',
				events: {
					mouseover: function() {
						showLabelOptions(this, $('#edit-y-label'), $('#new-y-label'), $('#new-y-color'), 20, this.chart.chartHeight/2.0 - 20);
					}
				}
			}
		}
	});
}

/* user options for changing axis/chart titles */
function changeLabelOptions() {
	$('div #cancel').click(function() {
		$('.edit').invisible();
	});

	$('.edit-color').spectrum({
		showInput: true,
		preferredFormat: 'hex',
		show: function(color) { spectrumVisible = true; },
		hide: function(color) { spectrumVisible = false; }
	});

	/* title settings */	
	function editLabel(labelElem, newLabelElem, newColorElem, editElem) {
		labelElem.setTitle({
			text: newLabelElem.val(),
			style: { color: newColorElem.val() }
		});
		editElem.invisible();
	}

	$('#apply-title').click(function() {
		editLabel(chart, $('#new-title'), $('#new-title-color'), $('#edit-title'));
	});

	$('#apply-x-label').click(function() {
		editLabel(chart.xAxis[0], $('#new-x-label'), $('#new-x-color'), $('#edit-x-label'));
	});

	$('#apply-y-label').click(function() {
		editLabel(chart.yAxis[0], $('#new-y-label'), $('#new-y-color'), $('#edit-y-label'));
	});
}

/* user options for changing plot range/display */
function chartDisplayOptions() {
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
		xAxis.setExtremes($('#x-min').val(), $('#x-max').val());
		yAxis.setExtremes($('#y-min').val(), $('#y-max').val());
		console.log("run change");
		console.log(xAxis.min, xAxis.max, yAxis.min, yAxis.max);
	});

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
		$('#chart-resizer').css("background", $('#chart-color').val());
	});
}

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
	$('#tab-view').resizable({ handles: 's' });

	$('#chart').resizable({
		resize: function() {
			var width = this.offsetWidth - 20;
			var height = this.offsetHeight - 20;

			chart.setSize(width, height, false);

			var marginWidth = 50 - (50.0 * width / $('#chart-container').width());
			$(this).css({ 'margin-left': marginWidth + '%' });
		}
	});
}

/* receive data from local .dat file and add to chart */
function getDataFromFile(seriesName, path) {
	$.ajax({
		type: "GET",
		url: path,
		success: function(content) {
			var seriesData = parseContent(content);
			chart.addSeries({
				id: seriesName,
				name: seriesName,
				data: seriesData,
			});
		},
		error: function(){
			alert(path + " not found");
		}
	});
}

/* parse .dat file */
function parseContent(content) {
	var contentPairs = content.split('\n');
	var dataPairs = new Array();

	for (var i = 0; i < contentPairs.length; i++) {
		if (contentPairs[i].length === 0) break;
		var curPair = contentPairs[i].split(' ');
		var x = parseFloat(curPair[0]);
		var y = parseFloat(curPair[1]);

		if (isNaN(x) || isNaN(y)) return [];
		dataPairs.push(new Array(x, y));
	}

	return dataPairs;
}

/* add series list and chart data */
function initSeries() {
	for (var i = 0; i < fileList.length; i++) {
		$('#series-list').append($('<option>')
			.append(fileList[i])
			.attr("name", fileList[i]));
		getDataFromFile(fileList[i], dataDir + '/' + fileList[i]);
	}
}
