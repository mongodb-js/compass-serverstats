const d3 = require('d3');

function realTimeLegend() {
  let width = 520;
  let labels = (data) => data.labels;
  let color = d3.scale.category10();
  let bubbleWidth = 8;
  let onToggle = function(/* d, i, active */) { /* no-op */ };

  function component(selection) {
    selection.each(function(data) {
      const keys = labels(data);
      const widthPerLabel = Math.floor(width / keys.length);

      // Legend
      const legendGroup = d3.select(this);
      const legendDiv = legendGroup.selectAll('g.subLegend').data(keys).enter()
        .append('g')
        .attr('class', 'subLegend')
        .attr('transform', function(d, i) {
          // TODO: Can this be gotten rid of? It seems sort of shady
          /*
           let minus = i * 5;

           if (i === keys.length - 1) {
           if (scale2) { // TODO:
           return 'translate(' + (subWidth - 120) + ',0)';
           }
           minus = minus - 15;
           }
           */

          return `translate(${i * widthPerLabel}, 0)`;
        });

      // Add boxes for legend
      legendDiv
        .append('rect')
        .attr('fill', (d, i) => color(i))
        .attr('stroke', (d, i) => color(i))
        .attr('class', 'chart-legend-box')
        .attr('id', function(d) { return 'box' + d; })
        .attr('width', bubbleWidth)
        .attr('height', bubbleWidth)
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
      legendDiv
        .append('text')
        .attr('class', 'chart-legend-linename')
        .attr('transform', `translate(${bubbleWidth + 5}, 9)`)
        .text((d, i) => keys[i]);
      legendDiv
        .append('text')
        .attr('class', (d) => `chart-legend-count text-${d}`)
        .attr('transform', `translate(${bubbleWidth + 7}, 22)`);
    });
  }

  component.width = function(value) {
    if (typeof value === 'undefined') return labels;
    width = value;
    return component;
  };

  component.labels = function(value) {
    if (typeof value === 'undefined') return labels;
    labels = value;
    return component;
  };

  component.color = function(value) {
    if (typeof value === 'undefined') return labels;
    color = value;
    return component;
  };

  component.bubbleWidth = function(value) {
    if (typeof value === 'undefined') return labels;
    bubbleWidth = value;
    return component;
  };

  component.onToggle = function(value) {
    if (typeof value === 'undefined') return labels;
    onToggle = value;
    return component;
  };

  return component;
}

module.exports = realTimeLegend;
