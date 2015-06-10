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
}(jQuery));

$(function () { 
	$('#container').highcharts({
		chart: {
			type: 'line',
			zoomType: 'xy'
		},

		credits: {
			enabled: false
		},
	
		title: {
			text: 'Position vs. Time'
		},
		
		xAxis: {
			title: {
				text: 'Time (ms)'
			}
		},
			
		yAxis: {
			title: {
				text: 'Number of Molecules'
			}
		},

		series: [{
			id: 'Molecule',
			name: 'Molecule',
			data: ypts
		}]
	});

	var chart = $('#container').highcharts();
	var series = chart.series[0];
	var mainSelect = $('#buttons-main');

	$('div #cancel').click(function() {
		$('.edit').invisible();
		mainSelect.visible();
	});

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
		});

		$('#cancel').click(function() {
			$('#series-bulk').invisible();
			mainSelect.visible();
		});
	});
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
