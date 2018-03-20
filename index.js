const assert = require ('assert');
const util = require ('util');

class UInt64 {
  constructor (n) {
    if (util.isBuffer (n)) {
      this.buffer = Buffer.from (n);
    } else if (util.isString (n)) {
      this.buffer = Buffer.from (n, 'hex');
    } else if (n instanceof UInt64) {
      this.buffer = Buffer.from (n.buffer);
    } else {
      this.buffer = Buffer.allocUnsafe (8);
      if (util.isNumber (n)) {
        this.buffer.writeUIntBE (n, 0, 8);
      }
    }
  }
  shl (count) {
    assert (util.isNumber (count));
    assert (count > 0);
    assert (count >>> 3 <= 8);

    const shift1 = count >>> 3;
    if (shift1 > 0) {
      for (let i = shift1; i < 8; i++) {
        this.buffer[i - shift1] = this.buffer[i];
        this.buffer[i] = 0;
      }
    }

    const shift2 = count & 7;
    if (shift2 > 0) {
      let a = 0, b = 0;
      for (let i = 7; i >= 0; i--) {
        a = this.buffer[i] >>> (8 - shift2);
        this.buffer[i] <<= shift2;
        this.buffer[i] |= b;
        b = a;
      }
    }

    return this;
  }
  shr (count) {
    assert (util.isNumber (count));
    assert (count > 0);
    assert (count >>> 3 <= 8);

    const shift1 = count >>> 3;
    if (shift1 > 0)
      for (let i = 8 - shift1; i >= 0; i--) {
        this.buffer[i + shift1] = this.buffer[i];
        this.buffer[i] = 0;
      }

    const shift2 = count & 7;
    if (shift2 > 0) {
      let a = 0, b = 0;
      for (let i = 0; i < 8; i++) {
        a = this.buffer[i] << (8 - shift2);
        this.buffer[i] >>>= shift2;
        this.buffer[i] |= b;
        b = a;
      }
    }

    return this;
  }
  xor (n) {
    assert (n);
    assert (n instanceof UInt64);

    for (let i = 0; i < 8; i++) {
      this.buffer[i] ^= n.buffer[i];
    }
    return this;
  }
  and (n) {
    assert (n);
    assert (n instanceof UInt64);

    for (let i = 0; i < 8; i++) {
      this.buffer[i] &= n.buffer[i];
    }
    return this;
  }
  or (n) {
    assert (n);
    assert (n instanceof UInt64);

    for (let i = 0; i < 8; i++) {
      this.buffer[i] |= n.buffer[i];
    }
    return this;
  }
  clone () {
    return new UInt64 (this);
  }
  add (n) {
    assert (n);
    assert (n instanceof UInt64);

    for (let i = 0; i < 8; i++) {
      this.buffer[i] += n.buffer[i]; // naive realization
    }

    return this;
  }
  not () {
    assert (n);
    assert (n instanceof UInt64);

    for (let i = 0; i < 8; i++) {
      this.buffer[i] = ~this.buffer[i];
    }
    return this;
  }
  mul (n) {
    assert (n);
    assert (n instanceof UInt64);

    for (let i = 0; i < 8; i++) {
      this.buffer[i] = Math.imul (this.buffer[i], n.buffer[i]); // naive realization
    }

    return this;
  }
}

function XorShift128 () {
  const kExponentBits = new UInt64 ('3FF0000000000000');
  const kMantissaMask = new UInt64 ('000FFFFFFFFFFFFF');

  let [state0, state1] = process.hrtime ().map (n => new UInt64 (n));

  return () => {
    let tmp;

    const s1 = state0.clone ();
    const s0 = state1.clone ();

    state0 = s0.clone ();

    tmp = s1.clone ();
    s1.shl (23).xor (tmp);

    tmp = s1.clone ();
    s1.shr (17).xor (tmp);

    s1.xor (s0);
    s1.xor (s0.shr (26));

    state1 = s1.clone ();

    tmp = state0.clone ();
    tmp.add (state1).and (kMantissaMask).or (kExponentBits);

    return tmp.buffer.readDoubleBE () - 1;
  };
}

module.exports = XorShift128;
