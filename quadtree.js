const assert = require('assert');

const computeAliveOrDead = (currentCell, neighbors = []) => {
  const count = neighbors.filter(el => el).length
  return currentCell ? count == 2 || count == 3 : count == 3;
}

class Quadtree {
  constructor({nw, ne, se, sw} = {}) {
    assert(nw.constructor.name === 'Quadtree' || typeof nw === 'boolean');
    assert(ne.constructor.name === 'Quadtree' || typeof ne === 'boolean');
    assert(se.constructor.name === 'Quadtree' || typeof se === 'boolean');
    assert(sw.constructor.name === 'Quadtree' || typeof sw === 'boolean');

    this.nw = nw;
    this.ne = ne;
    this.se = se;
    this.sw = sw;
  }

  centeredSubnode() {
    return new Quadtree({
      nw: this.nw.se,
      ne: this.ne.sw,
      sw: this.sw.ne,
      se: this.se.nw
    })
  }

  centeredHorizontal(w, e) {
    return new Quadtree({
      nw: w.ne.se,
      ne: e.nw.sw,
      sw: w.se.ne,
      se: e.sw.nw
    })
  }

  centeredVertical(n, s) {
    return new Quadtree({
      nw: n.sw.se,
      ne: n.se.sw,
      sw: s.nw.ne,
      se: s.ne.nw
    })
  }

  centeredSubSubnode() {
    return new Quadtree({
      nw: this.nw.se.se,
      ne: this.ne.sw.sw,
      sw: this.sw.ne.ne,
      se: this.se.nw.nw
    })
  }

  level() {
    if (typeof this.nw === 'boolean') {
      return 0;
    } else {
      return this.nw.level() + 1;
    }
  }

  nextGeneration() {
    if (this.level() === 2) {
      console.log(this.toString())
      const nw = new Quadtree({
        nw: computeAliveOrDead(this.nw.se.nw, [
          this.nw.se.se,
          this.nw.se.ne,
          this.nw.se.sw,
          this.nw.sw.se,
          this.nw.sw.ne,
          this.nw.nw.se,
          this.nw.ne.sw,
          this.nw.ne.se
        ]),
        ne: computeAliveOrDead(this.nw.se.ne, [
          this.nw.ne.se,
          this.nw.ne.sw,
          this.nw.se.sw,
          this.nw.se.se,
          this.nw.se.nw,
          this.ne.sw.nw,
          this.ne.sw.sw,
          this.ne.nw.sw,
        ]),
        sw: computeAliveOrDead(this.nw.se.sw),
        se: computeAliveOrDead(this.nw.se.se),
      })

      const ne = new Quadtree({
        nw: computeAliveOrDead(this.ne.sw.nw),
        ne: computeAliveOrDead(this.ne.sw.ne),
        sw: computeAliveOrDead(this.ne.sw.sw),
        se: computeAliveOrDead(this.ne.sw.se),
      })

      const sw = new Quadtree({
        nw: computeAliveOrDead(this.sw.ne.nw),
        ne: computeAliveOrDead(this.sw.ne.ne),
        sw: computeAliveOrDead(this.sw.ne.sw),
        se: computeAliveOrDead(this.sw.ne.se),
      })

      const se = new Quadtree({
        nw: computeAliveOrDead(this.se.nw.nw),
        ne: computeAliveOrDead(this.se.nw.ne),
        sw: computeAliveOrDead(this.se.nw.sw),
        se: computeAliveOrDead(this.se.nw.se),
      })

      return new Quadtree({ nw, ne, sw, se });
    } else {
      const n00 = this.nw.centeredSubnode(),
        n01 = this.centeredHorizontal(this.nw, this.ne),
        n02 = this.ne.centeredSubnode(),
        n10 = this.centeredVertical(this.nw, this.sw),
        n11 = this.centeredSubSubnode(),
        n12 = this.centeredVertical(this.ne, this.se),
        n20 = this.sw.centeredSubnode(),
        n21 = this.centeredHorizontal(this.sw, this.se),
        n22 = this.se.centeredSubnode();

      return new Quadtree({
        nw: new Quadtree({nw: n00, ne: n01, sw: n10, se: n11}).nextGeneration(),
        ne: new Quadtree({nw: n01, ne: n02, sw: n11, se: n12}).nextGeneration(),
        sw: new Quadtree({nw: n10, ne: n11, sw: n20, se: n21}).nextGeneration(),
        se: new Quadtree({nw: n11, ne: n12, sw: n21, se: n22}).nextGeneration()
      });
    }
  }

  equals(quadtree) {
    const check = direction =>
      this[direction].constructor.name === 'Quadtree'
        ? this[direction].equals(quadtree[direction])
        : this[direction] === quadtree[direction];

    return ['nw', 'ne', 'se', 'sw'].map(check).every(x => x === true);
  }

  toString(str) {
    return this.to2dArray().map(
      subarr => subarr.map(
        el => el ? '* ' : '. '
      ).join('')
    ).join('\n') + '\n'
  }

  static fromString(str) {
    const arr = str
      .trim()
      .split('\n')
      .map(line => line.trim().split(' ').map(el => (el === '.' ? false : true)));
    return this.from2dArray(arr);
  }

  to2dArray() {
    if (typeof this.nw === 'boolean') {
      return [
        [this.nw, this.ne],
        [this.sw, this.se]
      ]
    }

    const nw = this.nw.to2dArray();
    const ne = this.ne.to2dArray();
    const sw = this.sw.to2dArray();
    const se = this.se.to2dArray();

    let out = [];

    for (let i = 0; i < nw.length; i++) {
      out.push( [...nw[i], ...ne[i]] );
    }

    for (let i = 0; i < sw.length; i++) {
      out.push( [...sw[i], ...se[i]] );
    }

    return out;
  }

  static from2dArray(arr) {
    assert(
      arr.map(subarr => subarr.length).every(e => e === arr.length),
      `2d array is not square`,
    );

    if (arr.length === 1) {
      return arr[0][0];
    }

    const nw = arr
      .slice(0, arr.length / 2)
      .map(subarr => subarr.slice(0, subarr.length / 2));

    const ne = arr
      .slice(0, arr.length / 2)
      .map(subarr => subarr.slice(subarr.length / 2, subarr.length));

    const se = arr
      .slice(arr.length / 2, arr.length)
      .map(subarr => subarr.slice(subarr.length / 2, subarr.length));

    const sw = arr
      .slice(arr.length / 2, arr.length)
      .map(subarr => subarr.slice(0, subarr.length / 2));

    return new Quadtree({
      nw: this.from2dArray(nw),
      ne: this.from2dArray(ne),
      se: this.from2dArray(se),
      sw: this.from2dArray(sw),
    });
  }
}

module.exports = Quadtree;
