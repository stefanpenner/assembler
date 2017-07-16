'use strict';
// node dot.js  | dot -Tsvg > out.svg; and open -a Safari out.svg
const dotbars = require('dotbars');
const fs = require('fs');

const template = dotbars`
digraph G {
  {{#each edges}}
     "{{this.from}}" -> "{{this.to}}"
  {{/each}}
}
`;

console.log(template(JSON.parse(fs.readFileSync('out.json', 'UTF8'))));
