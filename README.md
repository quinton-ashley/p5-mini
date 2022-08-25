# p5-mini

Embed editable p5.js sketches on your own website!

Example use: https://p5play.org/learn/sprite.html

## Usage

Add p5-mini and the Ace online editor to your HTML:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.8.1/ace.min.js"></script>
<script src="https://quinton-ashley.github.io/p5-mini/p5-mini.js"></script>
```

Add p5.js scripts to your page and they will be embedded in an editor with an instanced preview of the sketch auto-playing by default.

```html
<script type="text/p5" name="Sketch">
	function setup() {
	  createCanvas(100, 100);
	}
</script>
```

p5-mini is also available as a npm package:

```bash
npm i p5-mini
```

## Options

You can add properties to the script tag to adjust the p5-mini player to your liking. Here's an example that limits the height of the editor to 10 lines.

```html
<script type="text/p5" name="Sketch" lines="10">
```

Other property options include:  
`horiz`/`vert` - horizontal or vertical layout (vert is the default)
`lines="#"` - sets the height of the editor to the specified number of lines  
`base-#` - specifies the sketch as a base sketch  
`base="#"` - will load the code in its editor into the draw function of the specified base sketch  
`editor-btn` - add the show/hide editor button  
`hide-editor` - hides the editor, just shows the preview
`hide` - hides the whole mini player, useful for invisible base sketches

## Advanced Usage

If you don't want all the sketches on a page to be automatically loaded when the p5-mini.js script executes you can disable auto-loading. Simply run this before the p5-mini.js script executes:

```js
window.p5m = {
	autoLoad: false
};
```

You can then load just the p5.js scripts inside an element by using the p5m.loadMinis function.

```js
p5m.loadMinis(elem);
```

You can also define the p5m.ready function, which is run when p5-mini is ready to load sketches.
