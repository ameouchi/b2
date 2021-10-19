const countryText = {
    "GTM": "Guatemala",
    "HND": "Honduras",
    "SLV": "El Salvador"
};
const pathwayAttr = {
    "regular": {"label": "Regular Pathway", "color": "#e23cad"},
    "irrregular coyote": {"label": "Irregular Pathway with a Smuggler", "color": "#3ba7c9"},
    "irregular on own, with caravan": {"label": "Irregular Pathway on their Own or with a Caravan", "color": "#1540c4"}
};

function bubbleChart() {
  var width = 1800;
  var height = 1000;
  var padding = 2;
  var tooltip = floatingTooltip('gates_tooltip');
  var center = { x: width / 2, y: height / 2 };

  var yearCenters = {
    "GTM": { x: width / 7, y: height / 2 },
    "HND": { x: width / 2, y: height / 2 },
    "SLV": { x: 2.5 * (1 * width / 3), y: height / 2 }
  };
  
    var beeCenters = {
    "all loans": { x: width / 7, y: height / 1 },
    "some loans": { x: width / 2, y: height / 1 },
    "no loans": { x: 2.5 * (1 * width / 3), y: height / 1 }
  };
  
var meansCenters = {
    "regular": { x: width / 7, y: height / 2 },
    "irregular on own, with caravan": { x: 2.3 * (1 * width / 5), y: height / 2 },
    "irrregular coyote": { x: 2.9 * (1 * width / 5), y: height / 2 }
  };
  var yearsTitleX = {
    "regular": 160,
    "irregular on own, with caravan": width - 160,
    "irrregular coyote": width - 160
  };
  
  var forceStrength = 0.02;
  var svg = null;
  var bubbles = null;
  var nodes = [];

  function charge(d) {
    return -Math.pow(d.radius, 1) * forceStrength;
  }

  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('collide', d3.forceCollide().radius(function(d) {
		return d.radius + padding;
		}).strength(.7))
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
//     .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);
  simulation.stop();

  var fillColor = d3.scaleOrdinal()
    .domain(['low', 'medium', 'high'])
    .range(['#3ba7c9', '#1540c4', '#e23cad']);

  function createNodes(rawData) {

var maxAmount = d3.max(rawData, function (d) { return +d.mig_ext_cost_total; });

    var radiusScale = d3.scalePow()
      .exponent(0.9)
      .range([2, 85])
      .domain([0, maxAmount]);

    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.mig_ext_cost_total),
        value: +d.mig_ext_cost_total,
        name: d.mig_ext_medio,
        // org: d.organization,
        group: d.mig_ext_finance,
        year: d.country,
        x: Math.random() * 1800,
        y: Math.random() * 1000
      };
    });

    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

  var chart = function chart(selector, rawData) {
    nodes = createNodes(rawData);

    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(d.name); })
      // .attr('stroke', function (d) { return d3.rgb(fillColor(d.name)).darker(); })
      .attr('stroke-width', .1)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    bubbles = bubbles.merge(bubblesE);

    bubbles.transition()
    .ease(d3.easeBounce)
      .duration(1)
      .attr('r', function (d) { return d.radius; });
      
    simulation.nodes(nodes);

    groupBubbles();
  };

  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  function nodeMeansPos(d) {
    return meansCenters[d.name].x;
  }
  
    function nodeCountryPos(d) {
    return yearCenters[d.year].x;
  }
  
      function nodeBeePos(d) {
    return beeCenters[d.group].x;
  }
  
  

  function groupBubbles() {
    hideYearTitles();

    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));

    simulation.alpha(1).restart();
  }

  function splitBubbles() {
    showYearTitles();

    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeMeansPos));

    simulation.alpha(1).restart();
  }
  
function splitBubblesCountry() {
    showYearTitles();

    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeCountryPos));

    simulation.alpha(1).restart();
  }
  
  function splitBubblesBee() {
    showYearTitles();

    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeBeePos));

    simulation.alpha(1).restart();
  }

  function hideYearTitles() {
    svg.selectAll('.name').remove();
  }

  function showYearTitles() {

    // var yearsData = d3.keys(yearsTitleX);
    var years = svg.selectAll('.name')
      // .data(yearsData);

    years.enter().append('text')
      .attr('class', 'year')
    //   .attr('x', function (d) { return yearsTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }

  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');

    // var content = '<span class="name">Means: </span><span class="value">' +
    //               d.name +
    //               '</span><br/>' +
    //               '<span class="name">Cost: </span><span class="value">$' +
    //               addCommas(d.value) +
    //               '</span><br/>' +
    //               '<span class="name">Country: </span><span class="value">' +
    //               d.year +
    //               '</span>';

    $("#gates_tooltip").empty();
    const tooltipTemplate = $(".tooltip.template");
    let tooltipContent = tooltipTemplate.clone();
    let pathwayColor = pathwayAttr[d.name].color;

    tooltipContent.find(".side-color").css("background", pathwayColor);
    tooltipContent.find(".text-color").css("color", pathwayColor);
    tooltipContent.find(".label-cost").html("$" + addCommas(d.value));
    tooltipContent.find(".label-country").html(countryText[d.country]);
    tooltipContent.find(".label-pathway").html(pathwayAttr[d.name].label);

    tooltipContent.children().appendTo("#gates_tooltip");

    // tooltip.showTooltip(content, d3.event);
    tooltip.showTooltip(d3.event);
  }

  function hideDetail(d) {
    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(d.group)).darker());

    tooltip.hideTooltip();
  }

  chart.toggleDisplay = function (displayName) {
    if (displayName === 'year') {
      splitBubbles();
    }   
   else if (displayName === 'country') 
      splitBubblesCountry();
      
	else if (displayName === 'uncolor') 
      changeColor();
      
       else if (displayName === 'bee') 
      splitBubblesBee();  
      
      
      else {
      groupBubbles();
    }
  };



  return chart;
}


var myBubbleChart = bubbleChart();


function display(error, data) {
  if (error) {
    console.log(error);
  }
  
  myBubbleChart('#vis', data);
}


function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}

function changeColor(color){
  d3.selectAll("circle")
    .transition()
    .duration(2000)
    .style("fill", '#662d91')
}

/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */
function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

// Load the data.
d3.csv('data/dots_data2.csv', display);

// setup the buttons.
setupButtons();
