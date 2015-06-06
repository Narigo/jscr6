import assert from 'assert';

describe('God', () => {
  it('kills alive cells if they have less than two neighbors', () => {
    let god = new God();
    let world = new World3d(3);
    world.populate(1, 1, 1);
    god.turnTime(world);
    assert.equal(world.inspect(1, 1, 1).isAlive(), false);

    world.populate(1, 1, 0);
    world.populate(1, 1, 1);
    god.turnTime(world);
    assert.equal(world.inspect(1, 1, 1).isAlive(), false);
  });

  it('lets cells live if they have two or three neighbors', () => {
    let god = new God();
    let world = new World3d(3);
    world.populate(1, 1, 0);
    world.populate(1, 1, 1);
    world.populate(1, 1, 2);
    god.turnTime(world);
    assert.equal(world.inspect(1, 1, 1).isAlive(), true);

    let world2 = new World3d(3);
    world2.populate(1, 0, 0);
    world2.populate(1, 1, 0);
    world2.populate(1, 1, 1);
    world2.populate(1, 1, 2);
    god.turnTime(world2);
    assert.equal(world2.inspect(1, 1, 1).isAlive(), true);
  });
  //it('kills alive cells if they have more than three neighbors', () => {
  //  let god = new God();
  //  let world = new World3d(3);
  //  world.populate(1, 1, 1);
  //  god.turnTime(world);
  //  assert.equal(world.inspect(1, 1, 1).isAlive(), false);
  //
  //  world.populate(1, 1, 0);
  //  world.populate(1, 1, 1);
  //  god.turnTime(world);
  //  assert.equal(world.inspect(1, 1, 1).isAlive(), false);
  //});
});

describe('World', () => {

  it('can be initialized with different sizes', () => {
    let world1 = new World3d(5);
    let world2 = new World3d(3);
    assert.equal(world1.size(), 5);
    assert.equal(world2.size(), 3);
  });

  it('can be populated', () => {
    let world1 = new World3d(2);
    world1.populate(0, 1, 0);
    assert.equal(world1.inspect(0, 1, 0).isAlive(), true);
    assert.equal(world1.inspect(0, 1, 1).isAlive(), false);
  });

  it('lets us inspect a coordinate', () => {
    let world = new World3d(3);
    world.populate(1, 1, 1);
    assert.equal(world.inspect(1, 1, 1).isAlive(), true);
    assert.equal(world.inspect(1, 0, 1).isAlive(), false);
  });

  it('counts all alive neighbors', () => {
    let world = new World3d(3);
    world.populate(1, 1, 1);
    assert.equal(world.countAliveNeighbors(1, 1, 1), 0);
    world.populate(1, 1, 0);
    assert.equal(world.countAliveNeighbors(1, 1, 1), 1);
    world.populate(1, 1, 2);
    assert.equal(world.countAliveNeighbors(1, 1, 1), 2);
  });

  it('does not have alive neighbors at the border', () => {
    let world = new World3d(3);
    world.populate(0, 0, 0);
    world.populate(2, 2, 2);
    assert.equal(world.countAliveNeighbors(1, 1, 1), 2);
    assert.equal(world.countAliveNeighbors(1, 0, 0), 1);
    assert.equal(world.countAliveNeighbors(2, 0, 0), 0);
  });
});

describe('Cell', () => {
  it('is alive or dead', () => {
    let cell = new Cell();
    assert.doesNotThrow(() => {
      cell.isAlive()
    });
  });

  it('can be initialized as living', () => {
    let cell = new Cell(true);
    assert.equal(cell.isAlive(), true);
  });

  it('can be initialized as dead', () => {
    let cell = new Cell(false);
    assert.equal(cell.isAlive(), false);
  });

  it('can be killed', () => {
    let cell = new Cell(true);
    cell.die();
    assert.equal(cell.isAlive(), false);
  });

  it('can be revived', () => {
    let cell = new Cell(false);
    cell.live();
    assert.equal(cell.isAlive(), true);
  });

  it('can be printed', () => {
    let cell1 = new Cell(true);
    let cell2 = new Cell(false);
    assert.equal(cell1.print(), '1');
    assert.equal(cell2.print(), '0');
  });
});

class Cell {
  constructor(alive) {
    this._alive = alive;
  }

  isAlive() {
    return this._alive;
  }

  die() {
    this._alive = false;
  }

  live() {
    this._alive = true;
  }

  print() {
    return (this._alive) ? '1' : '0';
  }
}

class World3d {
  constructor(size) {
    this._size = size;
    this._worldMap = new Array(size * size * size);
    for (let i = 0; i < this._worldMap.length; i++) {
      this._worldMap[i] = new Cell(false);
    }
  }

  inspect(x, y, z) {
    return this._worldMap[x + (y * this._size) + (z * this._size * this._size)];
  }

  size() {
    return this._size;
  }

  populate(x, y, z) {
    this._worldMap[x + y * this._size + z * this._size * this._size].live();
  }

  nextGeneration() {
    let newWorldArray = [];
    for (let i = 0; i < this._worldMap.length; i++) {
      let x = i % this._size;
      let y = parseInt(i / this._size) % this._size;
      let z = parseInt(i / this._size / this._size) % this._size;
      let oldCell = this._worldMap[i];
      let neighbors = this.countAliveNeighbors(x, y, z);
      if (oldCell.isAlive() && (neighbors == 2 || neighbors == 3)) {
        console.log('stay alive at ', x, y, z);
        newWorldArray[i] = new Cell(true);
      } else {
        console.log('died at ', x, y, z);
        newWorldArray[i] = new Cell(false);
      }
    }
    this._worldMap = newWorldArray;
  }

  countAliveNeighbors(x, y, z) {
    let neighbors = 0;
    for (let a = -1; a < 2; a++) {
      for (let b = -1; b < 2; b++) {
        for (let c = -1; c < 2; c++) {
          if ((x + a >= 0 && x + a < this._size) &&
            (y + b >= 0 && y + b < this._size) &&
            (z + c >= 0 && z + c < this._size)) {

            if (!(a == 0 && b == 0 && c == 0)) {
              neighbors +=
                this._worldMap[
                (x + a) +
                (y + b) * this._size +
                (z + c) * this._size * this._size
                  ].isAlive() ? 1 : 0;
            }

          }
        }
      }
    }
    return neighbors;
  }

}

class God {
  turnTime(world) {
    world.nextGeneration();
  }
}
