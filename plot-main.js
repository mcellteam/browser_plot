/*var dataDir = "test_sim/abc_files/mcell/react_data/seed_00001";
var fileList = ["a.World.dat", "b.World.dat"];*/

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

$(document).ready(function () {
	initChart();
	chart = $('#chart').highcharts();
	initSeries();
	changeLabelOptions();
	chartDisplayOptions();
	initResizable();
	seriesOps();
	editSeriesOptions();
	otherPlots();
});

/* initial Highcharts settings */
function initChart() {
	$('#chart').highcharts({
		chart: {
			events: {
				click: function(event) {
					$('.edit').invisible();
				}
			},
			type: 'line',
			zoomType: 'xy'
		},
		credits: { enabled: false },
		title: {
			useHTML: true,
			margin: 30,
			text: 'Reaction Data',
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
				events: {
					mouseover: function() {
						showLabelOptions(this, $('#edit-y-label'), $('#new-y-label'), $('#new-y-color'), 20, this.chart.chartHeight/2.0 - 20);
					}
				}
			}
		}
	});
}

/* display label edit options
 * labelElem: element containing label
 * editElem: element containing edit options
 */
function showLabelOptions(labelElem, editElem, newLabelElem, newColorElem, offsetX, offsetY) {
	editElem.visible();
	var pos = $('#chart').offset();
	var x = pos.left + offsetX;
	var y = pos.top + offsetY;
	editElem.position(x, y);
	newLabelElem.val(labelElem.options.title.text);
	newColorElem.val(labelElem.options.title.style.color);
}

/* user options for changing axis/chart titles
 * edit options displayed on label mouseover and
 * hidden on cancel/chart/apply click
 */
function changeLabelOptions() {
	$('div #cancel').click(function() {
		$('.edit').invisible();
	});

	$('.edit-color').spectrum({
		showInput: true,
		preferredFormat: 'hex'
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

	/* handle input changes */
	$('.plot-range').change(function() {
		xAxis.setExtremes($('#x-min').val(), $('#x-max').val());
		yAxis.setExtremes($('#y-min').val(), $('#y-max').val());
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

	/* might be slow */
	$('#chart-type').change(function() {
		if ($('#chart-type').attr('checked') === 'checked') {
			$.each(chart.series, function(_, series) {
				series.update({
					lineWidth: 2,
					type: 'line'
				});
			});
		} else {
			$.each(chart.series, function(_, series) {
				series.update({
					lineWidth: 0,
					type: 'scatter'
				});
			});
		}
	});
}

/* initializes resizable chart and left panel elements */
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

/* receives and parses data from local file and adds to chart
 * seriesName: desired name of new series
 * path: path to file
 */
function addSeriesFromFile(seriesName, path) {
	$.ajax({
		type: "GET",
		url: path,
		dataType: 'text',
		success: function(content) {
			var seriesData = parseContent(content);
			chart.addSeries({
				animation: false,
				data: seriesData,
				id: seriesName,
				name: seriesName
			});
		},
		error: function() {
			alert(path + " not found");
		}
	});
}

/* converts file content to array data */
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

/* read files, add initial series */
function initSeries() {
	var plotList;

	$.ajax({
		type: "POST",
		url: 'server.py',
		dataType: 'json',
		data: 'get_plot_specs',
		success: function(content) {	
			plotList = content.plotList;

			chart.xAxis[0].setTitle({ text: content.xlabel });
			chart.yAxis[0].setTitle({ text: content.ylabel });

			for (var i = 0; i < plotList.length; i++) {
				var fname = plotList[i].fname;
				var title = plotList[i].title;

				$('#series-list').append($('<option>')
					.append(title)
					.attr("name", title));
				addSeriesFromFile(title, fname);
			}
		},
		error: function() {
			alert("error getting file information");
		}
	});
}

/* renames series to newName and replaces relevant options in selection list */
function renameSeries(series, newName) {
	var prevName = series.name;
	series.update({
		id: newName,
		name: newName
	});

	$('#series-name').val(newName);
	$('#series-list option[name="' + prevName + '"]')
		.attr("name", newName)
		.text(newName);
}

/* initiate new series in chart and selection list */
function addSeries() {
	var defaultSeriesName = "Series " + chart.series.length;
	var newSeries = {
		animation: false,
		id: defaultSeriesName,
		name: defaultSeriesName
	};
	chart.addSeries(newSeries);
		
	$('#series-list option').removeAttr("selected");
	$('#series-list').append($('<option selected>')
		.append(defaultSeriesName)
		.attr("name", defaultSeriesName));
}

/* update series data on file change */
function changeSeriesFromFile() {
	var files = ($('#series-data'))[0].files;
	if (chart.get(files[0].name)) {
		alert("Series with this name already exists.");
		return;
	}

	var selectedOption = $('#series-list').val();
	if (selectedOption.length > 1) alert("Multiple series selected!");

	var curSeries = chart.get(selectedOption[0]);

	var f = new FileReader();
	f.onload = function(e) {
		var content = e.target.result;
		var seriesData = parseContent(content);
		curSeries.update({
			data: seriesData			
		});
	}

	renameSeries(curSeries, files[0].name);
	f.readAsText(files[0]);
}

/* display operations on multiple series */
function seriesOps() {
	$('#add-series').click(function() {
		addSeries();
		$('#series-list').trigger('change');
	});

	$('#remove-series').click(function() {
		var selectedOptions = $('#series-list').val();
		$('#series-list option:selected').remove();

		$.each(selectedOptions, function(_, seriesName) {
			chart.get(seriesName).remove();
		});

		$('#set-series').invisible();
	});

	$('#show-all').click(function() {
		var selectedOptions = $('#series-list').val();
		$.each(selectedOptions, function(_, seriesName) {
			chart.get(seriesName).show();
		});
	});

	$('#hide-all').click(function() {
		var selectedOptions = $('#series-list').val();
		$.each(selectedOptions, function(_, seriesName) {
			chart.get(seriesName).hide();
		});
	});
}

/* on series select */
function seriesSelected() {
	var selectedOptions = $('#series-list').val();
	$('#set-series').visible();
	
	if (selectedOptions.length === 1) {
		$('#set-series .one-series').show();
		$('#series-name').show();
		$('#series-data').show();
		$('#series-data').val('');

		var seriesName = selectedOptions[0];
		var series = chart.get(seriesName);
		$('#series-name').val(seriesName);
		$('#series-color').val(series.color);
		$('#series-color').spectrum({
			color: series.color,
			showInput: true,
			preferredFormat: 'hex'
		});
		
		$('#series-symbol').val(series.symbol);
	} else {
		$('#set-series .one-series').invisible();
		$('#series-name').invisible();
		$('#series-data').invisible();
	}
}

/* options for editing currently selected series */
function editSeriesOptions() {
	$('#series-list').change(function() {
		seriesSelected();
	});

	$('#series-data').change(function(e) {
		changeSeriesFromFile();
	});

	$('#series-name').change(function() {
		var selectedSeries = $('#series-list').val();
		if (selectedSeries.length > 1) {
			alert("Multiple series selected!");
		}
		var curSeries = chart.get(selectedSeries[0]);
		var newName = $('#series-name').val();

		if (chart.get(newName)) {
			alert("Series with this name already exists.");
			return;
		}
		renameSeries(curSeries, newName);
	});

	$('#series-color').change(function() {
		var selectedSeries = $('#series-list').val();
		$.each(selectedSeries, function(_, seriesName) {
			var curSeries = chart.get(seriesName);
			curSeries.update({
				color: $('#series-color').val()
			});
		});
	});

	$('#series-symbol').change(function() {
		var selectedSeries = $('#series-list').val();
		var selectedSymbol = $('#series-symbol').val();

		$.each(selectedSeries, function(_, seriesName) {
			var curSeries = chart.get(seriesName);
			curSeries.update({
				marker: {
					symbol: selectedSymbol
				}
			});
		});
	});
}

function otherPlots() {
	$('#gen-mean').click(function() {
		var selectedSeries = $('#series-list').val();
		var firstSeries = chart.get(selectedSeries[0]);
		var newSeriesData = new Array();
		$.each(firstSeries.data, function(index, val) {
			newSeriesData[index] = new Array(0, 0);
			newSeriesData[index][0] = val.x;
		});

		$.each(selectedSeries, function(_, seriesName) {
			var curSeries = chart.get(seriesName);
			$.each(curSeries.data, function(index, val) {
				newSeriesData[index][1] += val.y;
			});
		});
		$.each(newSeriesData, function(index, _) {
			newSeriesData[index][1] /= selectedSeries.length;
		});

		var defaultSeriesName = "Average " + chart.series.length;

		var newSeries = {
			animation: false,
			id: defaultSeriesName,
			name: defaultSeriesName,
			data: newSeriesData
		};
		chart.addSeries(newSeries);
	});
}
