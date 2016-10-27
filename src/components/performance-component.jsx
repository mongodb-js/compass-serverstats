const React = require('react');

const GraphsComponent = require('./server-stats-graphs-component');
const ListsComponent = require('./server-stats-lists-component');
const DBErrorComponent = require('./dberror-component');
const DBErrorStore = require('../stores/dberror-store');

/**
 * Renders the entire performance tab, including charts and lists.
 */
class PerformanceComponent extends React.Component {

  /**
   * Render the performance component.
   *
   * @returns {React.Component}
   */
  render() {
    return (
      <section className="rt-perf">
        <DBErrorComponent store={DBErrorStore} />
        <section className="rt__graphs-out">
          <GraphsComponent interval={this.props.interval} />
        </section>
        <section className="rt__lists-out">
          <ListsComponent interval={this.props.interval} />
        </section>
      </section>
    );
  }
}

PerformanceComponent.propTypes = {
  interval: React.PropTypes.number.isRequired
};

module.exports = PerformanceComponent;
