$(document).ready(function() {
    var ddata = function() {
        var velocityData = [];
        var burnUpData = []
        var cumulativePoints = 0;
        $("input").each( function(index) {
            if ($(this).val().replace(" ","") == "") {
                velocityData[index] = [index+1, 0];
                cumulativePoints += 0;
            } else {
                velocityData[index] = [index+1, $(this).val()];
                cumulativePoints += parseInt($(this).val());
            }
            burnUpData[index] = [index+1, cumulativePoints];
        });
        if (velocityData.length == 0) {
            return([[[]],[[]]]);
        }
        return [velocityData,burnUpData]; // Consider returning an object with cumulative points and num iterations to help draw the axes
    };
    
    var velocityPlot = $.jqplot('velocityPlot',  [ddata()[0]], {            
        title: "Velocity",
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
    
    var burnUpPlot = $.jqplot('burnUpPlot',  [ddata()[1]], {            
        title: "Burn Up",
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
        velocityPlot.replot({
            data: [ddata()[0]],
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
        
        burnUpPlot.replot({
            data: [ddata()[1]],
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
    
    var handleIterationKeyUp = function(input) {
        replot();
    }
    
    $("input").on("keyup", function(event) {
       var that = $(this);
       handleIterationKeyUp(that);
    });
    
    $("#iterationModifiers a#addIteration").on("click", function() {
        var nextIteration = $("#iterations input").length + 1;
        $("#iterations").append('<div><label>Iteration ' + nextIteration + '</label><input type="text" value=""></input></div>');
        $("#iterations input").last().on("keyup", function() {
            var that = $(this);
            handleIterationKeyUp(that);
        });
    });
    
    $("#iterationModifiers a#removeIteration").on("click", function() {
        $("#iterations div").last().remove();
        replot();
    });
});

