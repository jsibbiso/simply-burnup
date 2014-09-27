$(document).ready(function() {
    var ddata = function() {
        var velocityData = [];
        var burnUpData = []
        var cumulativePoints = 0;
        var iterations = 0;
        var maxValue = 0;
        var iterationValue;
        var totalScope;
        
        $("#iterations input").each( function(index) {
            iterationValue = $(this).val();
            
            if (iterationValue.replace(" ","") == "") {
                velocityData[index] = [index+1, 0];
                cumulativePoints += 0;
            } else {
                velocityData[index] = [index+1, $(this).val()];
                cumulativePoints += parseInt(iterationValue);
                if (parseInt(iterationValue) > maxValue) {
                    maxValue = parseInt(iterationValue);
                }
            }
            
            burnUpData[index] = [index+1, cumulativePoints];
            iterations += 1;
        });
        
        if (velocityData.length == 0) {
            return({
                velocityData: [[[]]],
                burnUpData: [[[]]],
                maxValue: 0,
                iterations: 0,
                maxCumValue: 0,
                totalScope: 0
            });
        }
        
        if ($("#totalScope").val().replace(" ","") == "") { totalScope = 0; } else { totalScope = parseInt($("#totalScope").val()); }
        
        var computedResults = {
            velocityData: [velocityData],
            burnUpData: [burnUpData],
            maxValue: maxValue,
            iterations: iterations,
            maxCumValue: cumulativePoints,
            totalScope: totalScope
        }
        return computedResults; // Consider returning an object with cumulative points and num iterations to help draw the axes
    };
    
    var velocityPlot = $.jqplot('velocityPlot',  ddata().velocityData, {            
        title: "Velocity",
        axes: {
            xaxis: {
                min: 0,
                max: 10,
                numberTicks: 6
            },
            yaxis: {
                min: 0,
                max: 100,
                numberTicks: 6
            }        
        }
    });
    
    var burnUpPlot = $.jqplot('burnUpPlot',  ddata().burnUpData, {            
        title: "Burn Up",
        axes: {
            xaxis: {
                min: 0,
                max: 10,
                numberTicks: 6
            },
            yaxis: {
                min: 0,
                max: 100,
                numberTicks: 6
            }        
        }
    });
    
    var replot = function() {
        var dataResults = ddata();
        var maxBurnupValue = Math.max(dataResults.totalScope, dataResults.maxCumValue);
        
        var maxY = Math.round(dataResults.maxValue * 1.33 + (5 - dataResults.maxValue * 1.33 % 5))
        var maxCumY = Math.round(maxBurnupValue * 1.1 + (5 - maxBurnupValue * 1.1 % 5))
        
        velocityPlot.replot({
            data: dataResults.velocityData,
            axes: {
                xaxis: {
                    min: 0,
                    max: dataResults.iterations + 1,
                    numberTicks: dataResults.iterations + 2
                },
                yaxis: {
                    min: 0,
                    max: maxY,
                    numberTicks: 6
                }        
            }
        });
        
        var totalScope = [];
        for(var i=0 ; i < dataResults.iterations * 2 ; i++ ) {
            totalScope[i] = [i+1,dataResults.totalScope];
        }
        dataResults.burnUpData.push(totalScope);
        
        burnUpPlot.replot({
            data: dataResults.burnUpData,
            axes: {
                xaxis: {
                    min: 0,
                    max: dataResults.iterations * 2,
                    numberTicks: dataResults.iterations * 2 + 1
                },
                yaxis: {
                    min: 0,
                    max: maxCumY,
                    numberTicks: 6
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

