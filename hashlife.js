class Quadtree {
  constructor({nw, ne, se, sw}) {
    this.nw = nw;
    this.ne = ne;
    this.se = se;
    this.sw = sw;
  }
}

let test = `
* . . . . . . . . . . . . . . *
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
* . . . . . . . . . . . . . . *
`;

const array2Quadtree = function (arr) {
  if (arr.length === 1) {
    return arr[0][0]
  }

  const nw = arr.slice(0, arr.length / 2)
    .map(subarr => subarr.slice(0, subarr.length / 2))

  const ne = arr.slice(0, arr.length / 2)
    .map(subarr => subarr.slice(subarr.length / 2, subarr.length))

  const se = arr.slice(arr.length / 2, arr.length)
    .map(subarr => subarr.slice(subarr.length / 2, subarr.length))

  const sw = arr.slice(arr.length / 2, arr.length)
    .map(subarr => subarr.slice(0, subarr.length / 2))

  return new Quadtree({
    nw: array2Quadtree(nw),
    ne: array2Quadtree(ne),
    se: array2Quadtree(se),
    sw: array2Quadtree(sw)
  });
};

test = test.split('\n')
  .slice(1, 17)
  .map(line => line.split(' ').map(el => (el === '.' ? false : true))),

console.log(
  array2Quadtree(test).nw.nw.nw
);
