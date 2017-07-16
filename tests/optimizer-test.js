'use strict';

const expect = require('chai').expect;

describe('optimizer', function() {
  let optimizer, manager;

  beforeEach(function() {
    optimizer = {}; // TODO:
    manager = {}; // TODO:
  });

  describe('toJSON', function() {
    it('works with empty', function() {
      expect(optimizer.toJSON()).to.deep.eql({});
    });
  });

  describe('optimize()', function() {
    describe('static', function() {
      it('combines', function() {
        let a = manager.nodeFor('a');
        let b = manager.nodeFor('b');

        manager.edgeFor({
          from: 'a',
          to: 'b',
          type: 'static',
        });

        // some budget that should make them seperate
        let subgraphs = manager.subgraphs(optimizer);

        // maybe the result provides some hinting information here

        expect(subgraphs.length).to.eql(1);
        expect(subgraphs[0].nodes()).to.deep.eql([a, b]);
      });
    });

    describe('implicit disjoint', function() {
      it('is combined if the budget suggests', function() {
        let a = manager.nodeFor('a');
        let b = manager.nodeFor('b');

        // some budget that allows them to be combined
        let subgraphs = manager.subgraphs(optimizer);

        expect(subgraphs.length).to.eql(1);
        expect(subgraphs[0].nodes()).to.deep.eql([a, b]);
      });

      it('is not combined if the budget does NOT suggest', function() {
        let a = manager.nodeFor('a');
        let b = manager.nodeFor('b');

        // some budget that DOST NOT allos them to be combined
        let subgraphs = manager.subgraphs(optimizer);

        expect(subgraphs.length).to.eql(2);
        expect(subgraphs[0].nodes()).to.deep.eql([a]);
        expect(subgraphs[1].nodes()).to.deep.eql([b]);
      });
    });
  });
});
