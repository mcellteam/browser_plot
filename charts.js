/* forged dataset */
var dataDir = "test_sim/abc_files/mcell/react_data/seed_00001";
var fileList = new Array("a.World.dat", "b.World.dat");

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

var spectrumVisible = false;

$(document).ready(function () {
	$('#chart').highcharts({
		chart: {
			type: 'scatter',
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
					var pos = $('#chart').offset();
					console.log(this);
					var x = pos.left + this.title.x;
					var y = pos.top + this.title.y;
					$('#edit-title').position(x, y);
					$('#new-title').val(this.options.title.text);
					$('#new-title-color').val(this.options.title.style.color);

					$('#edit-title').mouseleave(function() {
						if (!spectrumVisible)
							$('#edit-title').invisible();
					});
				},

				mouseout: function() {
					if ($('#edit-title:hover').length === 0 && !spectrumVisible)
						$('#edit-title').invisible();
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
						var title = this.chart.options.xAxis[0].title;
						$('#edit-x-label').visible();
						var pos = $('#chart').offset();
						var x = pos.left + this.chart.chartWidth/2.0;
						var y = pos.top + this.chart.chartHeight - 50;
						$('#edit-x-label').position(x, y);
						$('#new-x-label').val(this.options.title.text);
						$('#new-x-color').val(this.options.title.style.color);

						$('#edit-x-label').mouseleave(function() {
							if (!spectrumVisible)
								$('#edit-x-label').invisible();
						});
					},

					mouseout: function() {
						if ($('#edit-x-label:hover').length === 0 && !spectrumVisible)
							$('#edit-x-label').invisible();
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
						var title = this.chart.options.yAxis[0].title;
						$('#edit-y-label').visible();
						var pos = $('#chart').offset();
						var x = pos.left + 20;
						var y = pos.top + this.chart.chartHeight/2.0 - 20;
						$('#edit-y-label').position(x, y);
						$('#new-y-label').val(this.options.title.text);
						$('#new-y-color').val(this.options.title.style.color);

						$('#edit-y-label').mouseleave(function() {
							if (!spectrumVisible)
								$('#edit-y-label').invisible();
						});
					},

					mouseout: function() {
						if ($('#edit-y-label:hover').length === 0 && !spectrumVisible)
							$('#edit-y-label').invisible();
					}
				}
			}
		}
	});

	$('div #cancel').click(function() {
		$('.edit').invisible();
	});

	var chart = $('#chart').highcharts();

	chartLabelOptions(chart);
	chartDisplayOptions(chart);
	tabs(chart);
	addSeriesOptions(chart);
	updateSeriesOptions(chart);

	$('#left-panel').resizable({
		handles: 'e',
		resize: function(event, ui) {
			var widthPct = 99.0 - 100.0 * ui.size.width/$(window).width();
			$('#right-container').css({ 'width': widthPct + '%' });

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

			var marginWidth = 50 - (50.0 * width / $('#right-container').width());
			$(this).css({ 'margin-left': marginWidth + '%' });
		}
	});

	/*function getdatafromfile(filename)  {
// Read annotation file. Example : %timeinstant \t %value \n
// Return an array of string
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState==4 && xmlhttp.status==200)
				console.log(xmlhttp.responseText);
		}
		xmlhttp.open("GET", filename, true);
		xmlhttp.send();
	}
	getdatafromfile("../temp.txt");*/
	function getdatafromfile(path) {
		$.ajax({
			type: "GET",
			url: path,
			success: function(resp) {
				console.log(resp);
			},
			error: function(){
				console.log("NO");
			}
		});
	}
});

/* user options for changing axis/chart titles */
function chartLabelOptions(chart) {
	$('.edit-color').spectrum({
		showInput: true,
		preferredFormat: 'hex',
		show: function(color) {
			spectrumVisible = true;
		},
		hide: function(color) {
			spectrumVisible = false;
		}
	});

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

function tabs(chart) {
	$('#tabs a.tab').live('click', function() {
		if ($(this).parent().hasClass("current"))	{
			$(this).parent().removeClass("current");
			$('.tab-content').invisible();
			return;
		}

		// hide all other tabs
		$("#tabs li").removeClass("current");
		$(this).parent().addClass("current");

		//console.log($(this));
		if ($(this).attr("id") === "add-series") {
			$('#edit-series-tab').invisible();
			$('#add-series-tab').visible();
		} else {
			$('#add-series-tab').invisible();
			$('#edit-series-tab').visible();
			var seriesName = $(this).attr("name");
			var series = chart.get(seriesName);
			
			$('#edit-series-tab #series-name').val(seriesName);
			$("#edit-series-tab #series-color").spectrum({
				color: series.color,
				showInput: true,
				preferredFormat: 'hex'
			});

			$("#edit-series-tab #series-color").val(series.color);
		}
	});

	$('#tabs a.remove').live('click', function() {
		// confirm deletion (NI)
		var seriesLink = $(this).parent().children()[0];
		var seriesName = $(seriesLink).attr('name');
		console.log(seriesName);
		if (!confirm('Delete "' + seriesName + '"?'))
			return;

		// Get the tab name
		var tabid = $(this).parent().find(".tab").attr("id");

		// remove tab and related content
		$(this).parent().remove();
		$('#edit-series-tab').invisible();
		chart.get(seriesName).remove();

		// if there is no current tab and if there are still tabs left, show the first one
			if ($("#tabs li.current").length == 0 && $("#tabs li").length > 0) {

			// find the first tab    
			var firsttab = $("#add-series");
			firsttab.addClass("current");
		}
	});
}

function updateSeriesOptions(chart) {
	$('#edit-series-tab #update').click(function() {
		var curTab = $($('.current').children()[0]);
		var series = chart.get(curTab.attr('name'));

		var newName = $('#edit-series-tab #series-name').val();
		var newColor = $('#edit-series-tab #series-color').val();

		series.update({
			id: newName,
			name: newName,
			color: newColor
		});

		curTab.attr('name', newName)
			.text(newName);
	});
}

function addSeriesOptions(chart) {
	$('#add-series-tab #submit').click(function() {
		var seriesName = $('#add-series-tab #series-name').val();
		if (seriesName.length === 0) {
			alert("No name entered.");
			return;
		}

		if (chart.get(seriesName) != null) {
			alert("Already a series with this name.");
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

		lastTab++;

		var newTab = $('<li>')
			.append($('<a>')
				.addClass('tab')
				.attr('id', 'tab-' + lastTab)
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
		if (isNaN(x) || isNaN(y)) return [];
		series.push(new Array(x, y));
	}
	return series;
}
