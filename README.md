# p5-mini

Embed p5.js sketches on your own website!

## Usage

Add p5-mini and the Ace online editor to your HTML:

```html
<!-- put these in the head tag of your html file -->
<link rel="stylesheet" href="https://github.io/quinton-ashley/p5-mini/p5-mini.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.8.1/ace.min.js"></script>
<!-- put this script at the bottom of the body tag -->
<script src="https://github.io/quinton-ashley/p5-mini/p5-mini.js"></script>
```

Add p5.js scripts to your page and they will be embedded in an editor with a preview of the sketch auto-playing by default.

```html
<script type="text/p5" name="Sketch">
	function setup() {
		createCanvas(100, 100);
	}
</script>
```

## Options

You can add properties to the script tag to adjust the p5-mini player to your liking. Here's an example that limits the height of the editor to 10 lines.

```html
<script type="text/p5" name="Sketch" lines="10">
	...
</script>
```

Other property options include:
`horiz`/`vert` - whether the editor should be horizontal or vertical
`lines="#"` - sets the height of the editor to the specified number of lines
`base-#` - specifies the sketch as a base sketch
`base="#"` - will load the code from the script into the draw function of the specified base sketch
`no-editor` - hides the editor

## Example Use

View the source of this page: https://molleindustria.github.io/p5.play/v3_ref/sprite.html
https://github.com/molleindustria/p5.play/blob/gh-pages/v3_ref/sprite.html
