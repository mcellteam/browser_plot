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

	/*
	$('#set-lines').click(function() {
		var prevContent = $('.select').detach();
		var submitName = "Series name <input type = 'text' id = 'enter-series-name'>";
		var submitColor = "Change line color to <input type = 'color' id = 'enter-line-color'>";
		var submitWidth = "Change thickness to <select name = 'line-width' id = 'enter-thickness'>" +
		"<option value = 'thin'>Thin</option>" +
		"<option value = 'norm'>Normal</option>" +
		"<option value = 'thick'>Thick</option>";
		var submitButton = "<input id = 'submit-lines' type = 'submit'></input>";
		buttons.prepend(submitName + '<br/>' + submitColor + '<br/>' + submitWidth + '<br></br>' + submitButton);
		$('#submit-lines').click(function() {
			var curName = $('#enter-series-name').val();
			var newColor = $('#enter-line-color').val();
			var thickness = $('#enter-thickness').val();
			var series = chart.get(curName);

			if (series == null) {
				alert("Please enter a valid series name.");
			} else {
				if (newColor != "") {
					series.update({ color: newColor });
				}
			
				function toWidth(thicknessOption) {
					if (thicknessOption == "thin") return 2;
					else if (thicknessOption == "normal") return 5;
					return 10;
				}

				series.update({ lineWidth: toWidth(thickness) });
			}

			buttons.empty();
			buttons.prepend(prevContent);
		});
	});

	$('#add-series').click(function() {
		var prevContent = $('.select').detach();
		var submitName = "Enter series name <input type = 'text' id = 'enter-sname'>"
		var submitSeries = "Enter data separated by commas <input type = 'text' id = 'enter-series'> <br/> <button id = 'submit-series'>Submit</button>"
		buttons.prepend(submitName + "<br/>" + submitSeries);

		$('#submit-series').click(function() {
			var newName = $('#enter-sname').val();
			var dataStr = $('#enter-series').val();
			var newSeries = parseData(dataStr);

			if (newSeries.length > 0) {
				chart.addSeries({
					data: newSeries,
					id: newName,
					name: newName
				});
			} else {
				alert("Invalid series");
			}
			
			buttons.empty();
			buttons.prepend(prevContent);
		});
	});*/
});

/* aux functions */
function parseData(str) {
	var strArr = str.split(',');
	var series = new Array();	
	for (var i = 0; i < strArr.length; i++) {
		var next = parseInt(strArr[i]);
		//if (next == NaN) return [];
		series.push(next);
	}
	return series;
}
