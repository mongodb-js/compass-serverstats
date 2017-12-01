const chai = require('chai');
const chaiEnzyme = require('chai-enzyme');
const expect = chai.expect;
const enzyme = require('enzyme');
const React = require('react');

chai.use(chaiEnzyme());

const realTimeDispatcher = require('../../src/d3/real-time-dispatcher');
const TimeAndPauseButton = require('../../src/components/time-and-pause-button');

describe('<TimeAndPauseButton />', function() {
  context('when initialized, mounted and rendered', function() {
    beforeEach(function() {
      this.dispatcher = realTimeDispatcher();
      this.component = enzyme.mount(
        <TimeAndPauseButton
          paused={false}
          eventDispatcher={this.dispatcher}
        />
      );
    });

    it('shows a default time of 00:00:00', function() {
      expect(this.component.find('.currentTime').text()).to.equal('00:00:00');
    });

    context('when the eventDispatcher notifies a newXValue', function() {
      beforeEach(function() {
        this.dispatcher.newXValue(new Date(1512153289331));
      });

      it('shows the correct time', function() {
        expect(this.component.find('.currentTime').text()).to.equal('13:34:49');
      });
    });
  });
});
