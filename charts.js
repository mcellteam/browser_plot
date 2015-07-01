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

var chart; // global chart
var spectrumVisible = false; // true iff mouseover color inputs visible

$(document).ready(function () {
	initChart();

	chart = $('#chart').highcharts();
	changeLabelOptions(chart);
	chartDisplayOptions(chart);
	tabs(chart);

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

	editElem.mouseleave(function() {
		if (!spectrumVisible)
			editElem.invisible();
	});
}

/* initial Highcharts settings */
function initChart() {
	$('#chart').highcharts({
		chart: { type: 'scatter', zoomType: 'xy' },
		credits: { enabled: false },
	
		title: {
			useHTML: true,
			margin: 30,
			text: 'Title',
			events: {
				mouseover: function() {
					showLabelOptions(this, $('#edit-title'), $('#new-title'), $('#new-color'), this.title.x, this.title.y);
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
						showLabelOptions(this, $('#edit-x-label'), $('#new-x-label'), $('#new-x-color'), this.chart.chartWidth/2.0, this.chart.chartHeight - 50);
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
						showLabelOptions(this, $('#edit-y-label'), $('#new-y-label'), $('#new-y-color'), 20, this.chart.chartHeight/2.0 - 20);
					},

					mouseout: function() {
						if ($('#edit-y-label:hover').length === 0 && !spectrumVisible)
							$('#edit-y-label').invisible();
					}
				}
			}
		}

		, series: [{
			data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2]
		}]
	});
}

/* user options for changing axis/chart titles */
function changeLabelOptions(chart) {
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
