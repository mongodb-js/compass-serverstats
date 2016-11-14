/* eslint complexity:0 */
const d3 = require('d3');
const realTimeLegend = require('./real-time-legend');
const realTimeChartLines = require('./real-time-chart-lines');
const realTimeMouseOverlay = require('./real-time-mouse-overlay');

function realTimeLineChart() {
  const x = d3.time.scale();
  const y = d3.scale.linear();
  const y2 = d3.scale.linear();
  const bubbleWidth = 8;
  const margin = { top: 25, right: 40, bottom: 45, left: 55 };
  const dispatch = d3.dispatch('mouseover', 'mousemove', 'mouseout');

  let width = 520;
  let height = 160;
  let prefix = 'serverstats';
  let title = 'CHANGE ME';
  let xDomain = [0, 0];
  let yDomain = [0, 0];
  let y2Domain = null;
  let xVal = d => d.x;
  let xValues = (/* data */) => [];
  let yVal = d => d.y;
  let yUnits = '';
  let yValues = (/* data */) => [];
  let yData = (yValue, /* i */) => yValue.data;
  let yLabel = (yValue, /* i */) => yValue.label;
  let y2Val = d => d;
  let y2Units = '';
  let y2Values = (/* data */) => [];
  let y2Data = (y2Value, /* i */ ) => y2Value.data;
  let y2Label = (y2Value, /* i */) => y2Value.label;
  let defined = d => d.defined;
  let color = d3.scale.category10();
  let animationDelay = 5000;

  function chart(selection) {
    selection.each(function(data) {
      const subHeight = height - margin.top - margin.bottom;
      const subWidth = width - margin.left - margin.right;

      // TODO: Handle 0-state and bad data and error state (see original code)
      if (!data.localTime) {
        return;
      }

      /*
       * Setup Components
       */

      // Scale configuration
      x
        .domain(xDomain)
        .range([0, subWidth]);
      y
        .domain(yDomain)
        .range([subHeight, 0]);
      y2
        .domain(y2Domain ? y2Domain : [0, 0])
        .range([subHeight, 0]);

      // Lines configuration
      let lineContainer = null;
      let line2Container = null;
      const lines = realTimeChartLines()
        .xScale(x)
        .yScale(y)
        .xVal(xVal)
        .yVal(yVal)
        .yData(yData)
        .color(color)
        .defined(defined)
        .singlePointDistance(x(animationDelay) - x(0))
        .expectedPointSpeed(animationDelay);

      const lines2 = realTimeChartLines()
        .xScale(x)
        .yScale(y2)
        .xVal(xVal)
        .yVal(yVal)
        .yData(y2Data)
        .color((i) => color(i + yValues(data).length))
        .defined(defined)
        .singlePointDistance(x(animationDelay) - x(0))
        .expectedPointSpeed(animationDelay);

      // Legend Configuration
      const legendClass = `${prefix}-legend`;
      const legend = realTimeLegend()
        .label(yLabel)
        .yData(yData)
        .color(color)
        .prefix(legendClass)
        .onToggle((d, i, active) => {
          const newOpacity = active ? 1 : 0;

          lineContainer.selectAll('path.line')
            .filter((pathD) => pathD === d)
            .transition('opacity')
              .duration(100)
              .style('opacity', newOpacity);
        });

      const legend2 = realTimeLegend()
        .label(y2Label)
        .yData(y2Data)
        .justifyContent('flex-end')
        .color((i) => color(i + yValues(data).length))
        .prefix(legendClass)
        .onToggle((d, i, active) => {
          const newOpacity = active ? 1 : 0;

          line2Container.selectAll('path.line')
            .filter((pathD) => d === pathD)
            .transition('opacity')
              .duration(100)
              .style('opacity', newOpacity);
        });

      // Overlay Configuration
      function getNearestXIndex(xPosition) {
        const xValue = x.invert(xPosition);
        const bisectPosition = d3.bisectLeft(xValues(data), xValue);
        return Math.min(bisectPosition, xValues(data).length - 1);
      }
      const mouseOverlay = realTimeMouseOverlay()
        .bubbleWidth(8)
        .on('reposition', (xPosition) => {
          const nearestXIndex = getNearestXIndex(xPosition);
          legend.showValues(nearestXIndex);
          legend2.showValues(nearestXIndex);
          dispatch.mousemove.call(null, nearestXIndex);
        })
        .on('mouseover', (xPosition) => {
          const nearestXIndex = getNearestXIndex(xPosition);
          dispatch.mouseover(nearestXIndex);
        })
        .on('mouseout', dispatch.mouseout);

      /*
       * Setup Elements
       */

      const container = d3.select(this);
      // Add Title
      const chartTitleClass = `${prefix}-chart-title`;
      container.selectAll(`p.${chartTitleClass}`).data([0]).enter()
        .append('p')
        .attr('class', chartTitleClass)
        .text(title);

      // Create row for drawn elements and labels
      const chartRowEnter = container.selectAll(`div.${prefix}-chart-row`).data([0]).enter()
        .append('div')
          .attr('class', `${prefix}-chart-row`)
          .style('display', 'flex')
          .style('justify-content', 'center')
          .style('align-items', 'flex-start');

      // Create first axis label
      const maxYValueClass = `${prefix}-max-y-value`;
      const maxYUnitsClass = `${prefix}-max-y-units`;
      const firstAxisLabel = chartRowEnter.append('p')
        .attr('class', `${prefix}-y-axis-label`)
        .style('text-align', 'right')
        .style('width', `${margin.left - (bubbleWidth / 2)}px`);
      firstAxisLabel.append('span')
        .attr('class', maxYValueClass);
      firstAxisLabel.append('span')
        .attr('class', maxYUnitsClass);

      // Create svg for drawn elements
      chartRowEnter
        .append('svg')
        .attr('class', `${prefix}-chart`)
        .attr('height', subHeight + (bubbleWidth / 2))
        .attr('width', subWidth + bubbleWidth)
      // chart group
        .append('g')
        .attr('class', `${prefix}-chart-group`)
        .attr('transform', `translate(${bubbleWidth / 2}, ${bubbleWidth / 2})`)
      // Chart background
        .append('rect')
        .attr('class', `${prefix}-chart-background`)
        .attr('width', subWidth)
        .attr('height', subHeight);

      const g = container.selectAll(`g.${prefix}-chart-group`);

      // Create second axis label
      const maxY2ValueClass = `${prefix}-max-y2-value`;
      const maxY2UnitsClass = `${prefix}-max-y2-units`;
      const secondAxisLabel = chartRowEnter.append('p')
        .attr('class', `${prefix}-y2-axis-label`)
        .style('width', `${margin.right - (bubbleWidth / 2)}px`);
      secondAxisLabel.append('span')
        .attr('class', maxY2ValueClass);
      secondAxisLabel.append('span')
        .attr('class', maxY2UnitsClass);

      lineContainer = g.selectAll('.chart-line-group-container').data([yValues(data)]);
      lineContainer.enter()
        .append('g')
        .attr('class', 'chart-line-group-container');

      lineContainer.call(lines);

      // Update labels
      container.selectAll(`span.${maxYValueClass}`)
        .text(d3.format('s')(yDomain[1]));
      container.selectAll(`span.${maxYUnitsClass}`)
        .text(` ${yUnits}`);
      container.selectAll(`span.${maxY2ValueClass}`)
        .text(y2Domain ? d3.format('s')(y2Domain[1]) : '');
      container.selectAll(`span.${maxY2UnitsClass}`)
        .text(` ${y2Units}`);

      const legendContainerClass = `${prefix}-legend-container`;
      const fullLegendContainer = container.selectAll(`div.${legendContainerClass}`).data([0]);
      fullLegendContainer.enter()
        .append('div')
        .attr('class', legendContainerClass)
        .style('margin-left', `${margin.left}px`)
        .style('margin-right', `${margin.right}px`)
        .style('display', 'flex')
        .style('justify-content', 'space-between');

      const l = fullLegendContainer.selectAll(`div.${legendClass}`).data([yValues(data)]);
      l.enter()
        .append('div')
        .style('display', 'flex')
        .style('flex-grow', '1')
        .attr('class', legendClass);
      l.call(legend);

      line2Container = g.selectAll('.chart-line-group-container-2').data([y2Values(data)]);
      line2Container.enter()
        .append('g')
        .attr('class', 'chart-line-group-container-2');
      line2Container.call(lines2);

      const l2 = fullLegendContainer.selectAll(`div.${legendClass}-2`).data([y2Values(data)]);
      l2.enter()
        .append('div')
        .style('display', 'flex')
        .style('flex-grow', '1')
        .attr('class', `${legendClass}-2`);
      l2.call(legend2);

      container
        .selectAll(`svg.${prefix}-chart`)
        .call(mouseOverlay);
    });
  }

  // Configuration Getters & Setters
  chart.width = function(value) {
    if (typeof value === 'undefined') return width;
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (typeof value === 'undefined') return height;
    height = value;
    return chart;
  };

  chart.title = function(value) {
    if (typeof value === 'undefined') return title;
    title = value;
    return chart;
  };

  chart.xDomain = function(value) {
    if (typeof value === 'undefined') return xDomain;
    xDomain = value;
    return chart;
  };

  chart.yDomain = function(value) {
    if (typeof value === 'undefined') return yDomain;
    yDomain = value;
    return chart;
  };

  chart.y2Domain = function(value) {
    if (typeof value === 'undefined') return y2Domain;
    y2Domain = value;
    return chart;
  };

  chart.xVal = function(value) {
    if (typeof value === 'undefined') return xVal;
    xVal = value;
    return chart;
  };

  chart.xValues = function(value) {
    if (typeof value === 'undefined') return xValues;
    xValues = value;
    return chart;
  };

  chart.yVal = function(value) {
    if (typeof value === 'undefined') return yVal;
    yVal = value;
    return chart;
  };

  chart.yUnits = function(value) {
    if (typeof value === 'undefined') return yUnits;
    yUnits = value;
    return chart;
  };

  chart.y2Val = function(value) {
    if (typeof value === 'undefined') return y2Val;
    y2Val = value;
    return chart;
  };

  chart.y2Units = function(value) {
    if (typeof value === 'undefined') return y2Units;
    y2Units = value;
    return chart;
  };

  chart.yValues = function(value) {
    if (typeof value === 'undefined') return yValues;
    yValues = value;
    return chart;
  };

  chart.yData = function(value) {
    if (typeof value === 'undefined') return yData;
    yData = value;
    return chart;
  };

  chart.yLabel = function(value) {
    if (typeof value === 'undefined') return yLabel;
    yLabel = value;
    return chart;
  };

  chart.y2Values = function(value) {
    if (typeof value === 'undefined') return y2Values;
    y2Values = value;
    return chart;
  };

  chart.y2Data = function(value) {
    if (typeof value === 'undefined') return y2Data;
    y2Data = value;
    return chart;
  };

  chart.y2Label = function(value) {
    if (typeof value === 'undefined') return y2Label;
    y2Label = value;
    return chart;
  };

  chart.defined = function(value) {
    if (typeof value === 'undefined') return defined;
    defined = value;
    return chart;
  };

  chart.color = function(value) {
    if (typeof value === 'undefined') return color;
    color = value;
    return chart;
  };

  chart.on = function(event, cb) {
    dispatch.on(event, cb);
    return chart;
  };

  chart.prefix = function(value) {
    if (typeof value === 'undefined') return prefix;
    prefix = value;
    return chart;
  };

  chart.animationDelay = function(value) {
    if (typeof value === 'undefined') return animationDelay;
    animationDelay = value;
    return chart;
  };

  return chart;
}

module.exports = realTimeLineChart;
