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

$(window).load(function () {
	initChart();
	initData();
	initSeriesList();
	initLabelOptions();
	chartDisplayOptions();
	initResizable();
	otherPlots();
});

/*******************************************************
	window settings
*******************************************************/
$(window).resize(function() {
	triggerSetExtremes();
});

/*******************************************************
	shortcuts for accessing properties of chart state
*******************************************************/
function triggerSetExtremes() {
	var xAxis = chart.xAxis[0];
	var yAxis = chart.yAxis[0];
	xAxis.setExtremes(xAxis.min, xAxis.max);
	yAxis.setExtremes(yAxis.min, yAxis.max);
}

/*********************************************
	initial settings
********************************************/
function initChart() {
	chart = new Highcharts.Chart({
		chart: {
			events: {
				click: function (e) {
					$('.edit-label').invisible();
				},
				addSeries: triggerSetExtremes
			},
			renderTo: 'chart',
			type: 'line',			
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
			events: {
				afterSetExtremes: function(e) {
					$('#x-min').val(this.min);
					$('#x-max').val(this.max);
				}
			},
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
			events: {
				afterSetExtremes: function(e) {
					$('#y-min').val(this.min);
					$('#y-max').val(this.max);
				}
			},
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
		},

		plotOptions: {
			series: {
				animation: false,
				cursor: 'pointer',
				events: {
					click: function (e) {
						// select in sidebar
						var seriesOption = $('#series-list option[name="' + this.name + '"]');
						if (seriesOption.prop("selected")) {
							seriesOption.removeProp("selected");
						} else {
							seriesOption.prop("selected", true);
						}
						$('#series-list').change();
                    },
					hide: function(e) {
						triggerSetExtremes();
					},
					remove: function(e) {
						triggerSetExtremes();
					},
					show: function(e) {
						triggerSetExtremes();
					}
                }
            }
        },
	});
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
	editElem.children('.label-font')
		.val(labelElem.options.title.style.fontFamily);

	/* axis only */
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

	$('#toggle-legend').click(function() {
		var e = $('#toggle-legend');
		if (e.prop("checked"))
			$('.highcharts-legend').visible();
		else
			$('.highcharts-legend').invisible();
	});

	$('#toggle-ls').click(function() {
		var e = $('#toggle-ls');
		if (e.prop("checked"))
			updateAllSeries({ type: 'line' });
		else
			updateAllSeries({ type: 'scatter' });
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

function addSeriesFromPath(seriesName, path) {
	$.ajax({
		type: "GET",
		url: path,
		dataType: 'text',
		success: function(content) {
			var seriesData = parseContent(content);
			chart.addSeries({
				data: seriesData,
				id: seriesName,
				name: seriesName
			});
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
				addSeriesFromPath(title, fname);
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

/* updates all series with the given options */
function updateAllSeries(options) {
	for (var i = 0; i < chart.series.length; i++)
		chart.series[i].update(options);
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
		curSeries.update({ data: seriesData });
		renameSeries(curSeries, files[0].name);
	}
	f.readAsText(files[0]);
}

function addSeriesFromFile(file) {
	var reader = new FileReader();
	reader.onload = function(e) {
		var content = e.target.result;
		var seriesData = parseContent(content);
		var defaultSeriesName = file.name;

		/* todo: check for duplicates */
		var newSeries = {
			id: defaultSeriesName,
			name: defaultSeriesName,
			data: seriesData
		};
		chart.addSeries(newSeries);

		$('#series-list').append($('<option selected>')
			.append(defaultSeriesName)
			.attr("name", defaultSeriesName));
		$('#series-list').change();
	}
	reader.readAsText(file);
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

	$('#add-series').change(function() {
		$('#series-list option').removeProp("selected");

		var fileList = ($('#add-series'))[0].files;
		for (var i = 0; i < fileList.length; i++) {
			addSeriesFromFile(fileList[i]);
		}
		$('#add-series').val('');
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
		type: 'line'
	};
	chart.addSeries(newSeries);

	$('#series-list option').removeAttr("selected");
	$('#series-list').append($('<option selected>')
		.append(defaultSeriesName)
		.attr("name", defaultSeriesName));
	$('#series-list').change();
}

/********************
	switching modes
********************/
function getSelectedSeries() {
	var seriesList = new Array();
	var selectedOptions = $('#series-list').val();
	$.each(selectedOptions, function(_, seriesName) {
		seriesList.push(chart.get(seriesName));
	});
	return seriesList;
}

function otherPlots() {
	$('#gen-mean').click(function() {
		plotMean();
	});

	$('#gen-hist').click(function() {
		var w = window.open('histogram.html', '_blank', 'width=1000, height=600');
		w.origSeries = getSelectedSeries();
	});
}
