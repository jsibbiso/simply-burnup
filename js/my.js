var MonteCarlo = {
    calculate: function(totalScope, historicalVelocity) {
        //historical velocity is 1-D array left to right (not that order matters)
        var totalRuns = 100000;
        var monteCarloRunResults = {};
        
        var numDataPoints = historicalVelocity.length;
        var key, iteration, startingAmount = 0;
        
        for(key in historicalVelocity) {
            startingAmount += historicalVelocity[key];
        }
        
        if (startingAmount == 0) {
            //No velocity yet
            return {};
        }
        
        for(var i=0 ; i < totalRuns ; i++) {
            //Each run calculates which iteration total scope will be reached
            cumulativeTotal = startingAmount;
            iteration = numDataPoints;
            while (cumulativeTotal < totalScope) {
                cumulativeTotal += historicalVelocity[Math.floor(Math.random() * numDataPoints)];
                iteration++;
            }
            if (monteCarloRunResults[iteration] === undefined) {
                monteCarloRunResults[iteration] = 1;
            } else {
                monteCarloRunResults[iteration] = monteCarloRunResults[iteration] + 1;
            }
            
        }
        
        return monteCarloRunResults;   
    }
}

var Lines = {
    makeLine: function(x1, x2, y1, y2max) {
        var line = [];
        var curr = y1;
        var llinterval = (y2max - y1) / (x2 - x1);
        for(var i = x1 ; curr < y2max ; i++ ) {
            line[i-x1] = [i,curr];
            curr += llinterval;
        }
        line[i-x1] = [i,y2max]; // Add last iteration
        return line;
    }
}

$(document).ready(function() {
    var ddata = function() {
        var rawVelocityData = [];
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
                rawVelocityData.push(0);
                cumulativePoints += 0;
            } else {
                velocityData[index] = [index+1, $(this).val()];
                rawVelocityData.push(parseInt(iterationValue));
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
                totalScope: 0,
                monteCarlo: MonteCarlo.calculate(0,rawVelocityData)
            });
        }
        
        if ($("#totalScope").val().replace(" ","") == "") { totalScope = 0; } else { totalScope = parseInt($("#totalScope").val()); }
        
        var computedResults = {
            velocityData: [velocityData],
            burnUpData: [burnUpData],
            maxValue: maxValue,
            iterations: iterations,
            maxCumValue: cumulativePoints,
            totalScope: totalScope,
            monteCarlo: MonteCarlo.calculate(totalScope,rawVelocityData)
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
        var customBurnupMode = $("#estimationType").val() == 'custom';
        var dataResults = ddata();
        
        $("#monteCarloResults").empty();
        $("#customVelocityResults").empty();
        
        var maxY = Math.round(dataResults.maxValue * 1.33 + (5 - dataResults.maxValue * 1.33 % 5));
        
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
            },
            series: [
                {
                    markerOptions: {
                        size: 7
                    },
                    rendererOptions: {
                       smooth: true
                    }
                }
            ]
        });
        
        var maxLikelyIteration, minLikelyIteration, longestLikelihood, shortestLikelihood;
        
        if(customBurnupMode) {
            var customVelocity = parseInt($("#customVelocity").val());
            var posConePerc = parseFloat($("#posVelocityPerc").val()) || 0;
            var negConePerc = parseFloat($("#negVelocityPerc").val()) || 0;
            if(negConePerc >= 100) { negConePerc = 90; }
            
            if (customVelocity) {
                $("#customVelocityResults").append("<h4>Expected completion boundaries</h4>");
                
                //Setup data
                minLikelyIteration = Math.ceil(dataResults.iterations +
                    ( (dataResults.totalScope - dataResults.maxCumValue) /
                        (customVelocity * (1 + posConePerc / 100)) ) );
                maxLikelyIteration = Math.ceil(dataResults.iterations +
                    ( (dataResults.totalScope - dataResults.maxCumValue) /
                        (customVelocity * (1 - negConePerc / 100)) ) );
                
                $("#customVelocityResults").append("<p>Earliest is iteration " + minLikelyIteration + "</p>");
                $("#customVelocityResults").append("<p>Latest is iteration " + maxLikelyIteration + "</p>");
                
                //Draw lines
                longestLikelihood = Lines.makeLine(dataResults.iterations, maxLikelyIteration, dataResults.maxCumValue, dataResults.totalScope);
                shortestLikelihood = Lines.makeLine(dataResults.iterations, minLikelyIteration, dataResults.maxCumValue, dataResults.totalScope);
                
                dataResults.burnUpData.push(shortestLikelihood);
                dataResults.burnUpData.push(longestLikelihood);
            }
            
        } else { //Monte Carlo mode
            $("#monteCarloResults").append("<h4>Likelihood of completion</h4>");
            
            var key, chance, cumulativeChance = 0;
            minLikelyIteration = 999;
            
            //Setup data
            for(key in dataResults.monteCarlo) {
                if (parseInt(key) < minLikelyIteration) {
                    minLikelyIteration = parseInt(key);
                }
                
                chance = dataResults.monteCarlo[key] / 1000;
                cumulativeChance += chance;
                $("#monteCarloResults").append("<p>In iteration " + key + ": " + chance.toFixed(0) + "% and by iteration " + key + ": " + cumulativeChance.toFixed(0) + "%</p>");
            }
    
            maxLikelyIteration = parseInt(key);
            
            //Draw lines
            longestLikelihood = Lines.makeLine(dataResults.iterations, maxLikelyIteration, dataResults.maxCumValue, dataResults.totalScope);
            shortestLikelihood = Lines.makeLine(dataResults.iterations, minLikelyIteration, dataResults.maxCumValue, dataResults.totalScope);
            
            dataResults.burnUpData.push(shortestLikelihood);
            dataResults.burnUpData.push(longestLikelihood);
        }
        
        var totalScope = [];
        for(var i=0 ; i < maxLikelyIteration ; i++ ) {
            totalScope[i] = [i+1,dataResults.totalScope];
        }
        dataResults.burnUpData.push(totalScope);
        
        var maxBurnupValue = Math.max(dataResults.totalScope, dataResults.maxCumValue);
        var maxCumY = Math.round(maxBurnupValue * 1.1 + (5 - maxBurnupValue * 1.1 % 5));
        var maxCumX = Math.round(maxLikelyIteration + (5 - maxLikelyIteration % 5));
        
        burnUpPlot.replot({
            data: dataResults.burnUpData,
            axes: {
                xaxis: {
                    min: 0,
                    max: maxCumX,
                    numberTicks: 6
                },
                yaxis: {
                    min: 0,
                    max: maxCumY,
                    numberTicks: 6
                }        
            },
            series: [
                {
                    markerOptions: {
                        size: 7
                    }
                },
                {
                    showMarker: false,
                    showLine: false,
                },
                {
                    showMarker: false,
                    showLine: false,
                },
                {
                    lineWidth: 1,
                    showMarker: true,
                    markerOptions: {
                        style: 'dash',
                        lineWidth: 10,
                        size: 1
                    },
                },
            ],
            fillBetween: {
                series1: 1,
                series2: 2,
                color: "rgba(25, 175, 175, 0.2)",
                baseSeries: 0,
                fill: true
            },
        });
    }
    
    var handleIterationKeyUp = function(input) {
        replot();
    }
    
    $("input").on("keyup", function(event) {
       var that = $(this);
       handleIterationKeyUp(that);
    });
    
    $("#estimationType").on("change", function() {
        if($(this).val() == 'custom') {
            $("#monteCarloResults").hide();
            $("#customVelocityParams").show();
        } else {
            $("#monteCarloResults").show();
            $("#customVelocityParams").hide();
        }
        replot();
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
    
    //Set initial hide and show
    $("#monteCarloResults").show();
    $("#customVelocityParams").hide();
    replot();
});

