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
	});

	$('.chart-range').change(function() {
		var newWidth = $('#chart-width').val()/100.0 * $(window).width();
		var newHeight = $('#chart-height').val()/100.0 * $(window).width();
		chart.setSize(newWidth, newHeight);
	});

	$('#chart-color').change(function() {
		chart.chartBackground.css({
			color: $('#chart-color').val()
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
