$(document).ready(function() {
    var ddata = function() {
        var data = [];
        $("input").each( function(index) {
            if ($(this).val().replace(" ","") == "") {
                //do nothing
            } else {
            data[index] = [index+1, $(this).val()];
            }
        });
        if (data.length == 0) {
            return([[[]]]);
        }
        return [data];
    };
    
    var plot1 = $.jqplot('chartdiv',  ddata(), {            
        axes: {
            xaxis: {
                min: 0,
                max: 10,
                numberTicks: 11
            },
            yaxis: {
                min: 0,
                max: 100,
                numberTicks: 11
            }        
        }
    });
    
    $("input").on("change", function(event) {
        plot1.replot({
            data: ddata(),
            axes: {
                xaxis: {
                    min: 0,
                    max: 10,
                    numberTicks: 11
                },
                yaxis: {
                    min: 0,
                    max: 100,
                    numberTicks: 11
                }        
            }
        });
    });
});

