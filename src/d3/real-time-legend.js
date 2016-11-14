const d3 = require('d3');

function realTimeLegend() {
  let label = d => d.label;
  let color = d3.scale.category10();
  let bubbleWidth = 8;
  let onToggle = function(/* d, i, active */) { /* no-op */ };
  let justifyContent = 'flex-start';
  let yData = (yValues, /* i */) => yValues.data;

  function component(selection) {
    selection.each(function(data) {
      // Legend
      const legendGroup = d3.select(this);
      const legendDiv = legendGroup.selectAll('div.legend-item').data(data).enter()
        .append('div')
        .style('display', 'flex')
        .style('flex-grow', '1')
        .style('justify-content', justifyContent)
        .attr('class', 'legend-item');


      // Add boxes for legend
      legendDiv.append('svg')
        .attr('height', bubbleWidth + 2)
        .attr('width', bubbleWidth + 2)
        .append('rect')
          .attr('fill', (d, i) => color(i))
          .attr('stroke', (d, i) => color(i))
          .attr('class', 'chart-legend-box')
          .attr('width', bubbleWidth)
          .attr('height', bubbleWidth)
          .attr('x', 1)
          .attr('y', 1)
          .attr('rx', bubbleWidth / 5)
          .attr('ry', bubbleWidth / 5)
          .on('click', function(d, i) {
            const rect = d3.select(this);
            const active = rect.style('fill-opacity') !== '1';
            const newOpacity = active ? 1 : 0;
            rect.transition().duration(100)
              .style('fill-opacity', newOpacity);
            onToggle(d, i, active);
          });

      // Add text for legend
      const textSection = legendDiv.append('div');
      textSection
        .append('p')
        .attr('class', 'chart-legend-linename')
        .text(label);

      textSection
        .append('p')
        .attr('class', 'chart-legend-count');

      const valueText = legendGroup.selectAll('p.chart-legend-count');

      component.showValues = function(nearestXIndex) {
        valueText.text((d, i) => yData(d, i)[nearestXIndex]);
      };
    });
  }

  component.label = function(value) {
    if (typeof value === 'undefined') return label;
    label = value;
    return component;
  };

  component.color = function(value) {
    if (typeof value === 'undefined') return color;
    color = value;
    return component;
  };

  component.bubbleWidth = function(value) {
    if (typeof value === 'undefined') return bubbleWidth;
    bubbleWidth = value;
    return component;
  };

  component.onToggle = function(value) {
    if (typeof value === 'undefined') return onToggle;
    onToggle = value;
    return component;
  };

  component.justifyContent = function(value) {
    if (typeof value === 'undefined') return justifyContent;
    justifyContent = value;
    return component;
  };

  component.yData = function(value) {
    if (typeof value === 'undefined') return yData;
    yData = value;
    return component;
  };

  return component;
}

module.exports = realTimeLegend;
