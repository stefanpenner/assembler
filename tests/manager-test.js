'use strict';

const expect = require('chai').expect;

describe('manager', function() {
  let manager;

  beforeEach(function() {
    manager = {}; // TODO:
  });

  describe('toJSON', function() {
    it('works with empty', function() {
      expect(manager.toJSON()).to.deep.eql({
        nodes: [],
        edges: [],
      });
    });

    it('only nodes', function() {
      let a = manager.nodeFor('a');
      let b = manager.nodeFor('b');

      expect(manager.toJSON()).to.deep.eql({
        nodes: [a, b],
        edges: [],
      });
    });

    it('only edges', function() {
      let a_to_b = manager.edgeFor({
        to: 'a',
        from: 'b',
        type: 'import',
      });

      let b_to_c = manager.edgeFor({
        to: 'b',
        from: 'c',
        type: 'import',
      });

      expect(manager.toJSON()).to.deep.eql({
        nodes: [],
        edges: [a_to_b, b_to_c],
      });
    });

    it('mixed (nodes and edges)', function() {
      let a = manager.nodeFor('a');
      let b = manager.nodeFor('b');

      let a_to_b = manager.edgeFor({
        to: 'a',
        from: 'b',
        type: 'import',
      });

      let b_to_c = manager.edgeFor({
        to: 'b',
        from: 'c',
        type: 'import',
      });

      expect(manager.toJSON()).to.deep.eql({
        nodes: [a, b],
        edges: [a_to_b, b_to_c],
      });
    });
  });

  describe('subgraphs()', function() {
    it('static', function() {
      let a = manager.nodeFor('a');
      let b = manager.nodeFor('b');

      manager.edgeFor({
        from: 'a',
        to: 'b',
        type: 'static',
      });

      expect(manager.validate()).to.eql(true);

      let subgraphs = manager.subgraphs();

      expect(subgraphs.length).to.eql(1);
      expect(subgraphs[0].nodes()).to.deep.eql([a, b]);
    });

    it('implicit disjoint', function() {
      let a = manager.nodeFor('a');
      let b = manager.nodeFor('b');

      expect(manager.validate()).to.eql(true);

      let subgraphs = manager.subgraphs();

      expect(subgraphs.length).to.eql(2);
      expect(subgraphs[0].nodes()).to.deep.eql([a]);
      expect(subgraphs[1].nodes()).to.deep.eql([b]);
    });

    it('explicit disjoint (Satisfied)', function() {
      let a = manager.nodeFor('a');
      let b = manager.nodeFor('b');

      manager.edgeFor({
        from: 'a',
        to: 'b',
        type: 'disjoint', // an edge which forces these two nodes from being together
      });

      expect(manager.validate()).to.eql(true);

      let subgraphs = manager.subgraphs();

      expect(subgraphs.length).to.eql(2);
      expect(subgraphs[0].nodes()).to.deep.eql([a]);
      expect(subgraphs[1].nodes()).to.deep.eql([b]);
    });

    it('explicit disjoint (unsatisfied)', function() {
      let a = manager.nodeFor('a');
      let b = manager.nodeFor('b');

      manager.edgeFor({
        from: 'a',
        to: 'b',
        type: 'static', // an edge which forces these two nodes TO be together
      });

      manager.edgeFor({
        from: 'a',
        to: 'b',
        type: 'disjoint', // an edge which forces these two nodes from being together
      });

      expect(manager.validate()).to.eql(false);

      let subgraphs = manager.subgraphs();

      expect(subgraphs.length).to.eql(1);
      expect(subgraphs[0].nodes()).to.deep.eql([a, b]);
    });
  });

  describe('files example', function() {
    it('works', function() {
      let a = manager.nodeFor('a', { file: 'app/foo/a.js' });
      let b = manager.nodeFor('b', { file: 'app/foo/b.js' });

      manager.edgeFor({
        from: 'a',
        to: 'b',
        type: 'static',
      });

      manager.edgeFor({
        from: 'a',
        to: 'b',
        type: 'disjoint',
      });

      expect(manager.validate()).to.eql(false);

      let subgraphs = manager.subgraphs();

      expect(subgraphs.length).to.eql(1);
      expect(subgraphs[0].files()).to.deep.eql([a.data.file, b.data.file]);
    });
  });
});
