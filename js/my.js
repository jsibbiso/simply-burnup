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
        return [data]; // Consider returning an object with cumulative points and num iterations to help draw the axes
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
    
    var replot = function() {
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
    }
    
    $("input").on("keyup", function(event) {
       replot();
    });
    
    $("#iterationModifiers a#addIteration").on("click", function() {
        $("#iterations").append('<div><label>Iteration</label><input type="text" value=""></input></div>');
        $("#iterations input").last().on("keyup", function() {
           replot();
        });
    });
    
    $("#iterationModifiers a#removeIteration").on("click", function() {
        $("#iterations div").last().remove();
        replot();
    });
});

