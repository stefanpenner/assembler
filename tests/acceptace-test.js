'use strict';

const expect = require('chai').expect;

function file(x) {
  return {
    toNode() {
      // TODO: implement
      return x;
    },
  };
}

const manager = {};

describe('acceptance', function() {
  it('works', function() {
    let a = manager.fileFor(
      file(
        'a',
        `
      import b from './b';
      import y from 'npm:y';
      `
      )
    );

    let b = manager.nodeFor(
      file(
        'a',
        `
      import b from './b';
      import y from 'npm:y';
      `
      )
    );

    let c = manager.nodeFor(
      file(
        'c',
        `
      import y from 'npm:c';
      `
      )
    );

    let subgraphs = manager.subgraphs();
    expect(subgraphs.length).to.eql(1);
    let subgraph = subgraphs[0];

    // it learned about these nodes, somehow we taught it.

    expect(manager.hasNodeFor('npm:c')).to.eql(true);
    expect(manager.hasNodeFor('npm:y')).to.eql(true);

    let npmC = manager.nodeFor('npm:c');
    let npmY = manager.nodeFor('npm:y');

    // TODO:  something something patches

    expect(subgraph.files()).to.eql([
      npmC.data.file,
      npmY.data.file,
      a.data.file,
      b.data.file,
      c.data.file,
    ]);
  });
});
