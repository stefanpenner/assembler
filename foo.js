'use strict';

const walk = require('walk-sync');
const fs = require('fs');
const mrDepWalk = require('mr-dep-walk');
const ROOT = process.env.HOME + '/linkedin/voyager-web_trunk/core/lib/';

class Manager {
  constructor() {
    this.nodes = new Map();
    this.files = new Map();
    this.edges = new Map();
    // other indexes;
  }

  fileFor(id, root) {
    // todo: normalize
    let key = id + root;
    if (this.files.has(key)) {
      return this.files.get(key);
    } else {
      let file = new File(this, id, root);
      this.files.set(key, file);
      return file;
    }
  }

  edgeFor(type, from, to) {
    let key = `${type}|${from.id}|${to.id}`;

    if (this.edges.has(key)) {
      return this.edges.get(key);
    }

    let edge = new Edge(type, from, to);

    this.edges.set(key, edge);
    return edge;
  }

  toJSON() {
    return {
      edges: [...this.edges.values()].map(x => x.toJSON()),
      files: [...this.files.values()].map(x => x.toJSON()),
    };
  }
}

// this describes a file to our system
class File {
  constructor(manager, id, root) {
    this.manager = manager;
    this.id = id;
    this.root = root;

    this._out = undefined;
  }

  fullPath() {
    return `${this.root}/${this.id}`;
  }

  out() {
    // TODO: this should return all the dependencies that one can statically
    // infer from the contents of this file
    if (this._out) {
      return this._out;
    }

    if (this.root === null) {
      return [];
    }

    // TODO: analyze templates
    if (/\.hbs$/.test(this.id)) {
      return [];
    }

    this._out = mrDepWalk
      .depFilesFromFile(this.root, { entry: this.id })
      .map(file => {
        return this.manager.edgeFor(
          'import',
          this,
          this.manager.fileFor(file, null)
        );
      });

    return this._out;
  }

  toJSON() {
    return {
      id: this.id,
      out: this.out().map(file => file.id),
    };
  }
}

let edgeId = 0;
let nodeId = 0;

// a edge or dependency describing how our system is related
class Edge {
  // types:
  //   static:
  //   disjoint:
  //   implicit:
  //    app.js for app/*
  //    route for route levels
  //
  //   async: handled by the application
  //
  //   synthesized edges could be created for optimizations
  //
  constructor(type, from, to) {
    this.id = edgeId++;
    this.type = type;
    this.from = from;
    this.to = to;
    // cost/weight?
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      from: this.from.id,
      to: this.to.id,
    };
  }
}

// An Atom of our system (currently file/module, but could become functions/methods/constants etc)
class Node {
  constructor(id, manager, type, data) {
    this.id = id; // node id
    this.manager = manager;
    this.type = type; // node type
    this.data = data; // misc data
  }

  get in() {
    return this.manager.outEdgesFor(this);
  }

  get out() {
    return this.manager.inEdgesFor(this);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      data: this.data,
      in: this.in.map(toJSON),
      out: this.out.map(toJSON),
    };
  }
}

function toJSON(x) {
  return x.toJSON();
}

function isDirectory(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    if (typeof e === 'object' && e !== null && e.code === 'ENOENT') {
      return false;
    }
    throw e;
  }
}

// this describes a Route to our system
//
class Route {

}

// This describes an Engine to our system (for now engines and apps are the same thing)
// TODO: this needs to evolve,
class Engine {
  constructor(manager, root) {
    this.manager = manager;
    this.root = root;
    this.hasAppFiles = isDirectory(root + '/app');
    this.hasAddonFiles = isDirectory(root + '/addon');

    this._appFiles = undefined;
    this._addonFiles = undefined;
  }

  appFiles() {
    if (this.hasAppFiles === false) {
      return [];
    }

    return (
      this._appFiles ||
      (this._appFiles = walk(this.root + '/app', {
        directories: false,
        globs: ['**/*.{js,hbs}'],
      }).map(file => {
        return this.manager.fileFor(file, this.root + '/app');
      }))
    );
  }

  addonFiles() {
    if (this.hasAddonFiles === false) {
      return [];
    }

    return (
      this._addonFiles ||
      (this._addonFiles = walk(this.root + '/addon', {
        directories: false,
        globs: ['**/*.{js,hbs}'],
      })).map(file => {
        return this.manager.fileFor(file, this.root + '/addon');
      })
    );
  }

  ownDeps() {
    return [].concat(this.addonFiles(), this.appFiles());
  }
}

const manager = new Manager();

const engines = fs
  .readdirSync(ROOT)
  .map(file => ROOT + file)
  .filter(file => fs.statSync(file).isDirectory())
  .map(root => new Engine(manager, root));

engines.forEach(x => x.ownDeps().forEach(x => x.out()));
// debugger;
manager.addEntryNode(app);
engines.forEach(engine => manager.addEntryNode(engine));
console.log(JSON.stringify(manager.toJSON()));

// TODO:
//   File should not be a node, but instead describe to a node how it should work
//   manager should store state
//   tests for orphaned entitiees
//   subgraph detection (engine based, route layers)
//   external dependency satisfication
//
//   examples:
//
//   Engine hasMany Engines
//   Engine hasMany Routes
//   Engine hasMany Files
//   Route hasMany Files
//   File hasMany Files
//   File hasMany ExternalDependencies
//
//   but basically anything is possible
//
//
// Engine / File / Route
