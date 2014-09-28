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
    makeBurnUpLine: function(startIteration, finishIteration, startPoints, endPoints) {
        var longestLikelihood = [];
        var curr = startPoints;
        var llinterval = (endPoints - startPoints) / (finishIteration - startIteration);
        for(i = startIteration ; curr < endPoints ; i++ ) {
            longestLikelihood[i-startIteration] = [i,curr];
            curr += llinterval;
        }
        longestLikelihood[i-startIteration] = [i,curr]; // Add last iteration
        
        return longestLikelihood;
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
        var dataResults = ddata();
        
        $("#monte").empty();
        $("#monte").append("<h4>Likelihood of completion</h4>");
        
        var key, chance, cumulativeChance = 0, minLikelyIteration = 999;  
        for(key in dataResults.monteCarlo) {
            if (parseInt(key) < minLikelyIteration) {
                minLikelyIteration = parseInt(key);
            }
            
            chance = dataResults.monteCarlo[key] / 1000;
            cumulativeChance += chance;
            $("#monte").append("<p>In iteration " + key + ": " + chance.toFixed(0) + "% and by iteration " + key + ": " + cumulativeChance.toFixed(0) + "%</p>");
        }
        
        var maxBurnupValue = Math.max(dataResults.totalScope, dataResults.maxCumValue);
        
        var maxY = Math.round(dataResults.maxValue * 1.33 + (5 - dataResults.maxValue * 1.33 % 5));
        var maxCumY = Math.round(maxBurnupValue * 1.1 + (5 - maxBurnupValue * 1.1 % 5));

        var maxLikelyIteration = parseInt(key);
        var maxCumX = Math.round(maxLikelyIteration + (5 - maxLikelyIteration % 5)); 
        
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
        for(var i=0 ; i < maxLikelyIteration ; i++ ) {
            totalScope[i] = [i+1,dataResults.totalScope];
        }
        
        var longestLikelihood = Lines.makeBurnUpLine(dataResults.iterations, maxLikelyIteration, dataResults.maxCumValue, dataResults.totalScope);
        var shortestLikelihood = Lines.makeBurnUpLine(dataResults.iterations, minLikelyIteration, dataResults.maxCumValue, dataResults.totalScope);
        dataResults.burnUpData.push(totalScope);
        dataResults.burnUpData.push(shortestLikelihood);
        dataResults.burnUpData.push(longestLikelihood);
        
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

