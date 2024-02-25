Small webgl wrapper for generative art. Doesn't use any builders or preprocessors, only JS modules

# FFT

Initialize it:

```
let numberOfBands = 32
let fft = new FFT(numberOfBands)
```

And then each frame do

```
let freq = fft.get()
```
Data is normalized [0…1]. To start FFT you need to click the document. Before that `fft.get()` will return zeroes


# Textures

If you load a texture make sure it's loc doesn't interfere with other textures.

Loading images is as easy as

```
let u_tx_init = new Tx(gl, {src: './init.jpg', loc:3 })
```
Mipmap is generated autamatically. But make sure your shader has enough time for image to load. If you use `if(frame<2){ /* init stuff */ }` it won't work

# MIDI

Just make
```
let midi = new MIDI()
```
And midi is an and auto-updating array of 64 values ranging from 0 to 1
