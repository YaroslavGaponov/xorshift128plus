const XorShift128 = require ('./index.js');

const random = XorShift128 ();
for (let i = 0; i < 500; i++) {
  console.log (random ());
}
