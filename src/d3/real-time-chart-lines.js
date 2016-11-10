const d3 = require('d3');

function realTimeChartLines() {
  let lines = (data) => data.lines;
  let xScale = d3.time.scale();
  let yScale = d3.scale.linear();
  let xVal = (datum) => datum.x;
  let yVal = (datum) => datum.y;
  let color = d3.scale.category10();
  let defined = () => true;
  let singlePointDistance;
  let expectedPointSpeed;
  const x = (datum, i) => xScale(xVal(datum, i));
  const y = (datum, i) => yScale(yVal(datum, i));

  function component(selection) {
    selection.each(function(data) {
      const lineGroup = d3.select(this);
      // Update lines + Animate smoothly
      const line = d3.svg.line()
        .defined(defined)
        .interpolate('monotone')
        .x(x)
        .y(y);

      lineGroup.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
          .attr('width', Math.abs(xScale.range()[0] - xScale.range()[1]))
          .attr('height', Math.abs(yScale.range()[0] - yScale.range()[1]));

      lineGroup
          .attr('clip-path', 'url(#clip)');

      const dataLines = lineGroup.selectAll('path.line').data(lines(data), (d, i) => i);
      dataLines.enter().append('path')
        .attr('class', 'line')
        .attr('stroke', (d, i) => color(i))
        .style('fill', 'none');

      // animate if animation parameters have been specified
      if (!isNaN(Number(singlePointDistance)) && expectedPointSpeed) {
        dataLines.interrupt();
        dataLines
          .attr('d', line)
          .attr('transform', isNaN(singlePointDistance) ? null : `translate(${singlePointDistance})`)
          .transition()
            .duration(expectedPointSpeed)
            .ease(d3.ease('linear'))
            .attr('transform', 'translate(0)');
      }
    });
  }

  component.xScale = function(value) {
    if (typeof value === 'undefined') return xScale;
    xScale = value;
    return component;
  };

  component.yScale = function(value) {
    if (typeof value === 'undefined') return yScale;
    yScale = value;
    return component;
  };

  component.xVal = function(value) {
    if (typeof value === 'undefined') return xVal;
    xVal = value;
    return component;
  };

  component.yVal = function(value) {
    if (typeof value === 'undefined') return yVal;
    yVal = value;
    return component;
  };

  component.lines = function(value) {
    if (typeof value === 'undefined') return lines;
    lines = value;
    return component;
  };

  component.color = function(value) {
    if (typeof value === 'undefined') return color;
    color = value;
    return component;
  };

  component.defined = function(value) {
    if (typeof value === 'undefined') return defined;
    defined = value;
    return component;
  };

  component.singlePointDistance = function(value) {
    if (typeof value === 'undefined') return singlePointDistance;
    singlePointDistance = value;
    return component;
  };

  component.expectedPointSpeed = function(value) {
    if (typeof value === 'undefined') return expectedPointSpeed;
    expectedPointSpeed = value;
    return component;
  };

  return component;
}

module.exports = realTimeChartLines;
