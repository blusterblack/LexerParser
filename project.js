//lexer rule
let rule = {
  keyword: /^if|while|else|for|var|const|let/,
  bOperator: /^([\+\-\*\/=%<>]|[\+\-\*\/%]=|===)/,
  uOperator: /^(\+\+\|\-\-)/,
  identifier: /^[a-zA-Z_][a-zA-Z0-9_]*/,
  '{': /^{/,
  '}': /^}/,
  '(': /^\(/,
  ')': /^\)/,
  ';': /^;/,
  literal: /^([0-9]+|['"].*['"])/,
}
function lexer(str) {
  //repeatly apply Regex to string, delete match until str empty
  let ans = [];
  let rules = Object.entries(rule);
  while (str !== '') {
    for ([type, rule] of rules) {
      if (str.match(rule) !== null) {
        ans.push([str.match(rule)[0], type]);
        str = str.replace(rule, '');
        str = str.trim();
        break;
      }
    }
  }
  return ans;
}
//class to build AST
class Node {
  constructor(type, val) {
    this.type = type
    this.val = val;
    this.child = [];
  }
  add(node) {
    this.child.push(node);
  }
  f() {
    return this.type + " : " + this.val;
  }
}
//helper function to print AST
function output(node) {
  if (node.child.length !== 0) {
    console.log(node.f() + " child:[" + node.child.map(x => x.f()) + ']');
    for (i of node.child) {
      output(i);
    }
  }
}

//create AST
function parser(str) {
  let head = new Node('exp', str)
  parse(head);
  return head;
}
//parse rule
let pr = {
  identifier: /^[a-zA-Z_][a-zA-Z0-9_]*/,
  literal: /^([0-9]+|['"].*['"])/,
  statement: /^.+;/,
  compound: /^.+;.+/,
  if: /^if\((.+)\){?(.+)/,
  bOp: /^([a-zA-Z_][a-zA-Z0-9_]*|[0-9]+|['"].*['"])(==|===|!=|!==|>=|<=|[\+\-\*\/]=|[\+\-\*\/=<>])(.+)/,
  uOp: /^(?:(\+\+|\-\-|\!)([a-zA-Z_][a-zA-Z0-9_]*)|([a-zA-Z_][a-zA-Z0-9_]*)(\+\+|\-\-))/,
  for: /^for\(([^)]+)\){?(.+)/,
  while: /^while\((.+)\){?(.+)/,
  func: /^([^(]+)\((.*)\)/

}
//parse function, recursive parse using Regex until literal or identifier
function parse(node) {
  let type = node.type;
  let val = node.val.replace(/ /g, '');
  if (type !== 'identifier' && type !== 'literal') {
    if (pr.while.test(val)) {
      let m = val.match(pr.while);
      let temp = new Node('while', 'while');
      node.add(temp);
      let tmp = new Node('condition', m[1]);
      temp.add(tmp);
      parse(tmp);
      tmp = new Node('whileBody', m[2].replace('}', ''));
      temp.add(tmp);
      parse(tmp);
    }
    else if (pr.for.test(val)) {
      let m = val.match(pr.for);
      forExp = m[1].split(';');
      let temp = new Node('for', 'for');
      node.add(temp);
      let tmp = new Node('forInit', forExp[0]);
      temp.add(tmp);
      parse(tmp);
      tmp = new Node('forCond', forExp[1]);
      temp.add(tmp);
      parse(tmp);
      tmp = new Node('forFinal', forExp[2]);
      temp.add(tmp);
      parse(tmp);
      tmp = new Node('forBody', m[2].replace('}', ''));
      temp.add(tmp);
      parse(tmp);
    }
    else if (pr.if.test(val)) {
      let m = val.match(pr.if);
      let temp = new Node('if', 'if');
      node.add(temp);
      let tmp = new Node('condition', m[1]);
      temp.add(tmp);
      parse(tmp);
      tmp = new Node('ifBody', m[2]);
      temp.add(tmp);
      parse(tmp);
    }
    else if (pr.compound.test(val)) {
      let pos = val.search(';');
      tmp = new Node('exp', val.slice(0, pos));
      node.add(tmp);
      parse(tmp);
      tmp = new Node('exp', val.slice(pos + 1));
      node.add(tmp);
      parse(tmp);
    }
    else if (pr.statement.test(val)) {
      let tmp = new Node('exp', val.slice(0, -1));
      node.add(tmp);
      parse(tmp);
    }
    else if (pr.func.test(val)) {
      m = val.match(pr.func);
      temp = new Node("function", m[1]);
      node.add(temp);
      if (m.length === 3) {
        tmp = new Node('argument', m[2]);
        node.add(tmp);
        parse(tmp)
      }
    }
    else if (pr.uOp.test(val)) {
      m = val.match(pr.uOp);
      if (m[1] === undefined) {
        temp = new Node("bOperator", m[4]);
        tmp = new Node('exp', m[3]);
        temp.add(tmp);
        node.add(temp);
        parse(tmp);
      }
      else {
        temp = new Node("bOperator", m[1]);
        tmp = new Node('exp', m[2]);
        temp.add(tmp);
        node.add(temp);
        parse(tmp);
      }
    }
    else if (pr.bOp.test(val)) {
      let m = val.match(pr.bOp);
      let temp = new Node('bOperator', m[2]);
      node.add(temp);
      let tmp = new Node('exp', m[1]);
      temp.add(tmp);
      parse(tmp);
      tmp = new Node('exp', m[3]);
      temp.add(tmp);
      parse(tmp);
    }
    else if (pr['literal'].test(val)) {
      node.type = 'literal';
    }
    else if (pr.identifier.test(val)) {
      node.type = 'identifier';
    }
  }
}
const test = `dosth(a+3)`
console.log(lexer(test));
output(parser(test))
