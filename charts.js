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
		console.log($(this).css("display"));
		return $(this).css("display") === "none";
	}

	$.fn.position = function(x, y) {
		$(this).css("top", y + "px");
		$(this).css("left", x + "px");
	}
}(jQuery));

var chartX = 15, chartY = 2;

$(function () {
	$('div #cancel').click(function() {
		$('.edit').invisible();
	});

	$('#container').highcharts({
		chart: {
			borderColor: '#e8eaeb',
			borderWidth: 5,
			type: 'scatter',
			height: 0.6 * $(window).height(),
			width: 0.7 * $(window).width(),
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
					var x = chartX/100.0 * $(window).width() + this.title.x;
					var y = chartY/100.0 * $(window).height() + this.title.y + 20;
					$('#edit-title').position(x, y);
					$('#new-title').val(this.options.title.text);
					$('#new-title-color').val(this.options.title.style.color);
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
						var x = chartX/100.0 * $(window).width() + this.chart.chartWidth/2.0;
						var y = chartY/100.0 * $(window).height() + this.chart.chartHeight - 30;
						$('#edit-x-label').position(x, y);
						$('#new-x-label').val(this.options.title.text);
						$('#new-x-color').val(this.options.title.style.color);
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
						var x = chartX/100.0 * $(window).width() + 30;
						var y = chartY/100.0 * $(window).height() + this.chart.chartHeight/2.0;
						$('#edit-y-label').position(x, y);
						$('#new-y-label').val(this.options.title.text);
						$('#new-y-color').val(this.options.title.style.color);
					}
				}
			}
		},

		series: [{
			id: 'Molecule',
			name: 'Molecule',
			data: ypts
		}]
	});

	var chart = $('#container').highcharts();

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

	/* plot options */
	$('#show-dim').click(function() {
		if ($('#dim').hidden()) {
			console.log(5);
			$('#show-dim').css("background", "#BDBDBD");
			$('#show-display').css("background", "white");
			$('#dim').visible();
			$('#disp').invisible();
		}
	});

	$('#show-display').click(function() {
		if ($('#disp').hidden()) {
			$('#show-display').css("background", "#BDBDBD");
			$('#show-dim').css("background", "white");
			$('#dim').invisible();
			$('#disp').visible();
		}
	});

	/*
	$('#set-title').click(function() {
		mainSelect.invisible();
		$('#edit-title').visible();

		$('#enter-title').val(chart.options.title.text);
		$('#enter-color').val(chart.options.title.style.color);

		$('#submit-title').click(function() {
			var newTitle = $('#enter-title').val();
			var newColor = $('#enter-color').val();

			chart.setTitle({ text: newTitle });
			chart.setTitle({ style: { color: newColor }});

			$('#edit-title').invisible();
			mainSelect.visible();
		});
	});

	$('#set-background').click(function() {
		mainSelect.invisible();
		$('#edit-background').visible();

		$('#enter-bcolor').val(chart.options.chart.backgroundColor);

		$('#submit-color').click(function() {
			var newColor = $('#enter-bcolor').val();
			chart.chartBackground.css({ color: newColor });

			$('#edit-background').invisible();
			mainSelect.visible();
		});
	});

	$('#set-axes').click(function() {
		mainSelect.invisible();
		$('#edit-axes').visible();

		$('#enter-x').val(chart.options.xAxis[0].title.text);
		$('#enter-y').val(chart.options.yAxis[0].title.text);
		
		$('#submit-axes').click(function() {
			var xlabel = $('#enter-x').val();
			var ylabel = $('#enter-y').val();
			var xcolor = $('#enter-x-color').val();
			var ycolor = $('#enter-y-color').val();
			
			chart.xAxis[0].setTitle({ text: xlabel });
			chart.yAxis[0].setTitle({ text: ylabel });
			chart.xAxis[0].setTitle({ style: { color: xcolor }});
			chart.yAxis[0].setTitle({ style: { color: ycolor }});
		
			$('#edit-axes').invisible();
			mainSelect.visible();
		});
	});

	$('#set-lines').click(function() {
		mainSelect.invisible();
		$('#edit-series-display').visible();

		$('#submit-series-display').click(function() {
			var curName = $('#enter-series-name').val();
			var newColor = $('#enter-series-color').val();
			var thickness = $('#enter-thickness').val();

			var series = chart.get(curName);
			if (series == null) {
				alert("Please choose a valid series.");
			} else {
				series.update({ color: newColor });
			
				function toWidth(thicknessOption) {
					if (thicknessOption == "thin") return 2;
					else if (thicknessOption == "normal") return 5;
					return 10;
				}
				series.update({ lineWidth: toWidth(thickness) });

				$('#edit-series-display').invisible();
				mainSelect.visible();
			}
		});
	});

	$('#add-series').click(function() {
		mainSelect.invisible();
		$('#set-new-series').visible();

		$('#enter-new-name').val("");
		$('#enter-data').val("");

		$('#submit-new-series').unbind().click(function() {
			var newName = $('#enter-new-name').val();
			var dataAsStr = $('#enter-data').val();
			var newSeries = parseData(dataAsStr);

			if (newSeries.length > 0) {
				chart.addSeries({
					id: newName,
					name: newName,
					data: newSeries
				});
			
				$('#enter-series-name').append($('<option>', {
					value: newName,
					text: newName
				}));

				$('#series-selected').append($('<option>', {
					value: newName,
					text: newName
				}));
			} else {
				alert("Invalid series");
			}
			
			$('#set-new-series').invisible();
			mainSelect.visible();
		});
	});

	function performSeriesAction(action, seriesList) {
		$.each(seriesList, function(key, val) {
			if (action === "show") {
				chart.get(val).show();
			} else if (action === "hide") {
				chart.get(val).hide();
			} else if (action === "delete") {
				chart.get(val).remove();

				$('#enter-series-name option').each(function() {
					if ($(this).val() === val)
						$(this).remove();
				});

				$('#series-selected option').each(function() {
					if ($(this).val() === val)
						$(this).remove();
				});
			}
		});
	}

	var selectedSeries, selectedAction;
	$('#series-bulk').click(function() {
		mainSelect.invisible();
		$('#pre-select').visible();
		
		$('#from-list').click(function() {
			$('#pre-select').invisible();
			$('#select-series').visible();

			$('#submit-series-select').unbind().click(function() {
				selectedAction = $('#action-selected').val();
				selectedSeries = $('#series-selected').val();

				performSeriesAction(selectedAction, selectedSeries);

				$('#select-series').invisible();
				mainSelect.visible();
			});
		});

		$('#from-regex').click(function() {
			$('#pre-select').invisible();
			$('#search-series').visible();

			$('#submit-series-search').unbind().click(function() {
				
				$('#search-series').invisible();
				mainSelect.visible();
			});
		});

		$('#cancel').click(function() {
			$('#series-bulk').invisible();
			mainSelect.visible();
		});
	});*/
});

/* aux functions */
function parseData(str) {
	var strArr = str.split(',');
	var series = new Array();	
	for (var i = 0; i < strArr.length; i++) {
		var next = parseInt(strArr[i]); // this function is weird, maybe replace
		if (isNaN(next)) return [];
		series.push(next);
	}
	return series;
}
