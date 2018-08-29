// Stuff to do still:

// Code can be broken down further into funcitons.

const drawBarChart = (data, options, element) => {

  // Helper Functions:
  // This function will return a value that is X amount higher than the tallest point (gives whitespace to the chart)
  findHighestPoint = (data, nearest) => {
    let highestValue = 0;
    for (i = 0; i < data.length; i++) {
      if (highestValue < data[i][1]) {
        highestValue = data[i][1];
      }
    }
    return Math.ceil(highestValue / nearest) * nearest;
  };

  dimensions = (renderArea) => {
    // Determine the dimensions of the renderArea:
    let elementHeight = renderArea.height();
    let elementWidth = renderArea.width();

    // If user has not set default dimensions for the renderArea div's:
    if (elementHeight < 250) {
      console.warn("barChartIt: Consider setting appropriate height for the DOM renderArea that will render the barChartIt. Setting default height of 250px.");
      elementHeight = 250;
      renderArea.height(elementHeight);
    }

    if (elementWidth < 400) {
      console.warn("barChartIt: Consider setting appropriate width for the DOM renderArea that will render the barChartIt. Setting default height of 400px.");
      elementWidth = 400;
      renderArea.width(elementWidth);
    }

    return {
      "height": elementHeight - 50,
      "width": elementWidth - 25
    };
  };

  mergeArrays = (data, sortMethod) => {
    let newArr = [];
    for (let i = 0; i < data.length; i++) {
      for (j = 0; j < data[i].length; j++) {
        // Also pushes what array this originally belong to. Allows for user customization:
        newArr.push([data[i][j][0], data[i][j][1], i]);
      }
    }

    // Sorting:
    if (sortMethod === "ascending") {
      newArr.sort(function(a, b) {
        return a[1] - b[1];
      });
    } else if (sortMethod === "descending") {
      newArr.sort(function(a, b) {
        return b[1] - a[1];
      });
    }

    return newArr;
  };

  // Variable Declaration:
  // Let user pass in either a string or jQuery object for where to place chart:
  let renderArea;
  if (element.jquery) {
    renderArea = element;
  } else if (typeof element === 'string') {
    renderArea = $(element);
  } else {
    console.error("barChartIt: Third argument passed to drawBarChart() must be a string or jQuery object.");
  }

  // User customizable options. Default set below:
  const {
    title = "", titleFontSize = "12", titleFontColour = "grey", barColours = ["blue", "red", "green", "yellow", "purple"], labelColour = "black", barSpacing = 5, fontSize = 8, positionOfValues = "center", tickFactor = 5, sortMethod = "none"
  } = options;

  // Merge the data from all arrays (and sort) but keep track of original data set (for colouring bars)
  const mergedData = mergeArrays(data, sortMethod);
  const highestBar = findHighestPoint(mergedData, tickFactor);

  // Set dimensions of the area:
  let chartHeight = dimensions(renderArea).height;
  let chartWidth = dimensions(renderArea).width;

  // Create an area in the renderArea where the chart will actually be rendered:
  renderArea.append("<!-- barChartIt Rendered Below: --><div class='barChartIt'></div><!-- /.barChartIt -->");
  $(".barChartIt").width(chartWidth);
  $(".barChartIt").height(chartHeight);

  // Add title:
  $(".barChartIt").append(`<div class='titleArea'>${title}</div>`);

  // Add user defined styling to titleArea:
  $(".titleArea").css({
    "color": titleFontColour,
    "font-size": `${titleFontSize}px`
  });

  // Labeling Values on side of chart:
  // tickFactor determines increments:
  const labelSpaceBetween = highestBar / tickFactor;
  const eachLinePx = chartHeight / labelSpaceBetween;

  // Create a div that spans across the width of the chart:
  $(".barChartIt").append("<div class='chartingArea'></div>");
  let labelCounter = highestBar;
  // Append divs for each tick, creating the side labels:
  for (o = 0; labelCounter > 0; o += eachLinePx) {
    $('.chartingArea').append(`<div class="label label-${labelCounter}">${labelCounter}</div>`);
    labelCounter -= tickFactor;
  }
  $('.barChartIt').append('<div class="barArea">');
  $('.barChartIt').append('<div class="barLabelArea">');

  // Append a label "0" to the bottom of the chart:
  $('.barLabelArea').append(`<div class="label-0">0</div>`);

  // Add custom user styles to the side labels:
  $(".label").css({
    "height": `${eachLinePx - 1}px`,
    "color": labelColour
  });

  $(".label-0").css({
    "color": labelColour
  });

  // Calculate the number of bars needed, and the space they will take:
  const numberOfBars = mergedData.length;
  const numberOfSpaces = numberOfBars - 1;
  const sizeOfBars = (chartWidth - (numberOfSpaces * barSpacing)) / numberOfBars;

  // Create the bars and their labels, adding to the posLeft which absolutely position divs
  let posLeft = 0;

  for (let i = 0; i < numberOfBars; i++) {
    const barGroup = mergedData[i][2];
    const barLabel = mergedData[i][0];
    const barValue = mergedData[i][1];
    if (barColours[barGroup] === undefined) {
      barColours.push("blue", "red", "green", "yellow", "purple");
      console.warn(`barChartIt: User has not defined a colour for the bars of data set #${barGroup + 1} (Array ${barGroup}). Consider adding additional colors to the barColours array in options.`);
    }
    const colorOfBar = barColours[barGroup];
    const barHeight = barValue * chartHeight / highestBar;
    const barHtml = `<div class="bar-${i} bar"><div class ="bar-${i}-label bar-label">${barValue}</div></div>`;
    const barLabelHtml = `<div class='bar-text-label bar-${i}-text-label'>${barLabel}</div>`;

    $('.barArea').append(barHtml);
    $('.barLabelArea').append(barLabelHtml);

    // Apply custom user options and calculated dimensions to the bars:
    $(`.bar-${i}`).css({
      "width": sizeOfBars,
      "height": barHeight,
      "left": posLeft,
      "background": colorOfBar
    });

    // Apply custom user options and calculated dimensions to labels:
    $(`.bar-${i}-text-label`).css({
      "width": sizeOfBars,
      "left": posLeft,
      "font-size": fontSize,
      "color": labelColour
    });

    // Apply custom user options to the labels in the bar:
    $(`.bar-${i}-label`).css({
      "font-size": fontSize,
      "color": labelColour
    });

    // Determine where the label is positioned in the bar:
    if (positionOfValues === "center") {
      $(`.bar-${i}-label`).css({
        "top": "50%"
      });
    } else {
      $(`.bar-${i}-label`).css({
        [positionOfValues]: "5px"
      });
    }

    posLeft += sizeOfBars + barSpacing;

  }
  // Close the .barArea div:
  $('.barArea').append("</div>");

};
// End drawBarChart
