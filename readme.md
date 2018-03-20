XorShift128
=============

function returns a floating-point, pseudo-random number in the range from 0 inclusive up to but not including 1

# Info

Base on XorShift128 algorithm


# Example
```javascript
const XorShift128 = require ('XorShift128');

const random = XorShift128 ();
for (let i = 0; i < 500; i++) {
  console.log (random ());
}
```

```bash
0.4158761240955171
0.37245949959692637
0.8289185915237824
0.7259127802960466
0.740681322627317
0.72358154159893
0.21865364150584532
0.559509959144642
0.46286476662235376
```
