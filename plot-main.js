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
/* master version of series info
 * key: series name
 * val: data
 * to be updated in sync with current chart
 */
var masterSeriesData;

/* histogram settings updated while in hist. mode
 */
var histOptions;

$(document).ready(function () {
	initChart();
	initData();
	initSeriesList();
	changeLabelOptions();
	chartDisplayOptions();
	initResizable();
	otherPlots();
});

/*******************************************************
	shortcuts for accessing properties of chart state
*******************************************************/
function getMode() { return $('input[type="radio"][name="chart-type"]:checked').val(); }

function getSeriesType(mode) {
	if (mode === "line" || mode === "scatter") return mode;
	else if (mode === "hist") return "column";
	alert("Invalid mode!");
}

/*********************************************
	initial chart/settings
********************************************/
function initChart() {
	$('#chart').highcharts({
		chart: {
			events: {
				click: function(event) {
					$('.edit-label').invisible();
				}
			},
			zoomType: 'xy'
		},
		credits: { enabled: false },
		title: {
			useHTML: true,
			margin: 30,
			text: 'Reaction Data',
			events: {
				click: function() {
					showLabelOptions(this, $('.edit-label[name="title"]'), this.title.x, this.title.y);
				}
			},
			style: {
				fontFamily: 'Lucida Grande',
				fontSize: '18px'
			}
		},

		xAxis: {
			events: {
				afterSetExtremes: function(e) {
					if (getMode() === "line" || getMode() === "scatter") {
						$('#x-min').val(this.min);
						$('#x-max').val(this.max);
					}
				}
			},
			title: {
				events: {
					click: function() {
						showLabelOptions(this, $('.edit-label[name="x-label"]'), this.chart.chartWidth/2.0, this.chart.chartHeight - 60);
					}
				},

				style: { fontSize: '12px', fontFamily: 'Lucida Grande' }
			}
		},
			
		yAxis: {
			events: {
				afterSetExtremes: function(e) {
					if (getMode() === "line" || getMode() === "scatter") {
						$('#y-min').val(this.min);
						$('#y-max').val(this.max);
					}
				}
			},
			title: {
				events: {
					click: function() {
						showLabelOptions(this, $('.edit-label[name="y-label"]'), 20, this.chart.chartHeight/2.0 - 20);
					}
				},

				style: { fontSize: '12px', fontFamily: 'Lucida Grande' }
			}
		},

		plotOptions: {
			series: {
				animation: false,
				cursor: 'pointer',
				events: {
					click: function (event) {
						// select in sidebar
						var seriesOption = $('#series-list option[name="' + this.name + '"]');
						if (seriesOption.prop("selected")) {
							seriesOption.removeProp("selected");
						} else {
							seriesOption.prop("selected", true);
						}
						$('#series-list').change();
                    }
                }
            }
        },
	});

	chart = $('#chart').highcharts();

	histOptions = {
		binCount: 10
	};
}
/*********************************************
	various chart display functions follow
********************************************/

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
}

function getLabelElem(eName) {
	switch (eName) {
		case "title": return chart;
		case "x-label": return chart.xAxis[0];
		case "y-label": return chart.yAxis[0]; 
		default: alert("error");
	}
}

/* user options for changing axis/chart titles
 * edit options displayed on label mouseover and
 * hidden on cancel/chart/apply click
 */
function changeLabelOptions() {
	$('.cancel').click(function() {
		$('.edit-label').invisible();
	});

	$('.label-color').spectrum({
		showInput: true,
		preferredFormat: 'hex'
	});

	$('.apply-label').click(function() {
		var parent = $(this).parent();
		var labelElem = getLabelElem(parent.attr("name"));
		labelElem.setTitle({
			text: parent.children('.label-text').val(),
			style: {
				color: parent.children('.label-color').val(),
				fontSize: parent.children('.label-size').val() + 'px'
			}
		});

		$('.edit-label').invisible();
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
		$('#chart').css("background", $('#chart-color').val());
	});

	/* histogram settings */
	$('#bin-count').change(function() {
		var binCount = $('#bin-count').val();
		histOptions.binCount = parseInt(binCount);
		updateHistOptions();
		updateCategories();
		updateSeriesMode("hist");
	});

	$('#toggle-legend').click(function() {
		var e = $('#toggle-legend');
		if (e.prop("checked")) {
			$('.highcharts-legend').visible();
		} else {
			$('.highcharts-legend').invisible();
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

/***********************************************
	functions for initializing series follow
***********************************************/

/* receives and parses data from local file and adds to chart
 * seriesName: desired name of new series
 * path: path to file
 */

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

function addSeriesFromFile(seriesName, path) {
	$.ajax({
		type: "GET",
		url: path,
		dataType: 'text',
		success: function(content) {
			var seriesData = parseContent(content);
			chart.addSeries({
				data: dataAsType(seriesData, getMode()),
				id: seriesName,
				name: seriesName
			});

			// todo: check for duplicate series
			masterSeriesData[seriesName] = seriesData;
		},
		error: function() {
			alert(path + " not found");
		}
	}).done(function() {
		chart.zoom();
	});
}



/* read files, add initial series */
function initData() {
	masterSeriesData = { };
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

/*********************************************
	functions for series operations follow
*********************************************/

/* renames series to newName and replaces relevant options in selection list */
function renameSeries(series, newName) {
	var prevName = series.name;
	series.update({
		id: newName,
		name: newName
	});

	masterSeriesData[newName] = masterSeriesData[prevName];
	delete masterSeriesData[prevName];

	$('#series-name').val(newName);
	$('#series-list option[name="' + prevName + '"]')
		.attr("name", newName)
		.text(newName);
}

/* initiate empty series in chart and selection list */
function addEmptySeries() {
	var defaultSeriesName = "Series " + chart.series.length;
	var newSeries = {
		id: defaultSeriesName,
		name: defaultSeriesName,
		type: getSeriesType(getMode())
	};
	chart.addSeries(newSeries);
	masterSeriesData[defaultSeriesName] = newSeries.data;

	// todo: check for duplicate series
		
	$('#series-list option').removeProp("selected");
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
	if (selectedOption.length > 1) {
		alert("Multiple series selected!");
		return;
	}

	var curSeries = chart.get(selectedOption[0]);

	var f = new FileReader();
	f.onload = function(e) {
		var content = e.target.result;
		var seriesData = parseContent(content);
		masterSeriesData[selectedOption[0]] = seriesData;
		curSeries.update({
			data: dataAsType(seriesData, $('input[type="radio"][name="chart-type"]:checked').val())
		});
		renameSeries(curSeries, files[0].name);
	}
	f.readAsText(files[0]);
}

/*********************************************
	functions for series sidebar follow
*********************************************/

/* display operations on multiple series */
function seriesListOps() {
	$('#series-list').click(function(e) {
		if (e.target == this) {
			$('#series-list option').removeProp("selected");
			$('#series-list').change();
		}
	});

	$('#series-list').change(function() {
		seriesSelected();
	});

	$('#add-series').click(function() {
		addEmptySeries();
		$('#series-list').change();
	});

	$('#remove-series').click(function() {
		var selectedOptions = $('#series-list').val();
		$('#series-list option:selected').remove();

		$.each(selectedOptions, function(_, seriesName) {
			chart.get(seriesName).remove();
			delete masterSeriesData[seriesName];
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

	if (!selectedOptions) {
		$('#set-series').invisible();
	} else if (selectedOptions.length === 1) {
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

	$('#gen-mean').click(function() {
		plotMean();
	});
}

function initSeriesList() {
	editSeriesOptions();
	seriesListOps();
}

function plotMean() {
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
		id: defaultSeriesName,
		name: defaultSeriesName,
		data: newSeriesData,
		type: getSeriesType(getMode())
	};
	chart.addSeries(newSeries);
	masterSeriesData[defaultSeriesName] = newSeriesData;

	$('#series-list option').removeAttr("selected");
	$('#series-list').append($('<option selected>')
		.append(defaultSeriesName)
		.attr("name", defaultSeriesName));
	$('#series-list').change();
}

/********************
	switching modes
********************/

function otherPlots() {
	$('input[type="radio"][name="chart-type"]').change(function() {
		var mode = getMode();

		if (mode === "line") {
			plotLS("line");
		} else if (mode == "scatter") {
			plotLS("scatter");
		} else if (mode === "hist") {
			chart.zoom();
			plotHist();
		} else {
			alert("Unsupported chart type");
		}
	});
}

function getDataExtremes() {
	var extremes = new Array(null, null);
	$.each(chart.series, function(_, series) {
		$.each(masterSeriesData[series.name], function(_, pt) {
			if (extremes[0] === null) {
				extremes[0] = pt[1];
				extremes[1] = pt[1];
			} else {
				extremes[0] = Math.min(extremes[0], pt[1]);
				extremes[1] = Math.max(extremes[1], pt[1]);
			}
		});
	});
	return extremes;
}

function updateSeriesMode(mode) {
	if (mode === "hist") {
		$.each(chart.series, function(_, series) {
			var seriesData = masterSeriesData[series.name];
			series.update({
				data: dataAsType(seriesData, "hist"),
				type: 'column'
			});
		});
	}
}

function dataAsType(data, mode) {
	if (mode === "line" || mode === "scatter") return data;
	else if (mode === "hist") {
		var binCount = histOptions.binCount;
		var seriesData = new Array();
		for (var i = 0; i < binCount; i++) seriesData.push(0);

		var binSize = histOptions.binSize;
		var extremes = getDataExtremes();

		$.each(data, function(_, pt) {
			var binIndex = Math.floor((pt[1] - extremes[0])/binSize);
			seriesData[binIndex]++;
		});

		return seriesData;
	} else {
		alert("Datatype not supported");
	}
}

function plotLS(mode) {
	$('#chart-settings #line-scatter').visible();
	$('#chart-settings .on-plot').not($('#line-scatter')).invisible();
	chart.xAxis[0].setCategories(null);
	$.each(chart.series, function(_, series) {
		series.update({
			data: masterSeriesData[series.name],
			type: mode
		});
	});
	
	chart.zoom();
}

function updateInMode(mode) {
	if (mode === "hist") {
		updateCategories();
	}
}

/*************************
	histogram mode
*************************/
function updateHistOptions() {
	//var yAxis = chart.yAxis[0];
	var binCount = histOptions.binCount;
	var extremes = getDataExtremes();
	var binSize = Math.floor((extremes[1] - extremes[0])/binCount) + 1;

	$('#bin-count').val(binCount);
	histOptions.binSize = binSize;
}

function updateCategories() {
	var categories = new Array();
	var binCount = histOptions.binCount;
	var binSize = histOptions.binSize;

	var extremes = getDataExtremes();	

	for (var i = 0; i < binCount; i++) {
		var xMin = extremes[0] + i * binSize;
		categories.push(xMin + " - " + (xMin + binSize - 1));
	}
	
	chart.xAxis[0].setCategories(categories);
}

function plotHist() {
	$('#chart-settings #hist').visible();
	$('#chart-settings .on-plot').not($('#hist')).invisible();

	updateHistOptions();	
	updateCategories();
	updateSeriesMode("hist");

	chart.zoom();
}
