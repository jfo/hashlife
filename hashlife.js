class Quadtree {
  constructor({nw, ne, se, sw}) {
    this.nw = nw;
    this.ne = ne;
    this.se = se;
    this.sw = sw;
  }
}

console.log(new Quadtree({nw: 1, ne: 0, se: 1, sw: 0}));
