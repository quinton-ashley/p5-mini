if (typeof window.p5m == 'undefined') window.p5m = {};
ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.9.5/');
ace.config.loadModule('ace/ext/language_tools', function () {
	const log = console.log;

	let completions = [
		{ value: 'new Sprite', score: 2, meta: '(ani, x, y, w, h, collider)' },
		{ value: 'Sprite', score: 1, meta: '(ani, x, y, w, h, collider)' },
		{ value: 'new Group', score: 1, meta: '()' },
		{ value: 'Group', score: 1, meta: '()' },
		{ value: 'createCanvas', score: 1, meta: '(w, h)' },
		{ value: 'ani', score: 1, meta: 'SpriteAnimation' },
		{ value: 'createSprite', score: 1, meta: '(ani, x, y, w, h, collider)' },
		{ value: 'createGroup', score: 1, meta: '()' }
	];

	const p5functions = [
		'preload',
		'setup',
		'draw',
		'keyPressed',
		'keyReleased',
		'keyTyped',
		'mouseMoved',
		'mouseDragged',
		'mousePressed',
		'mouseReleased',
		'mouseClicked',
		'touchStarted',
		'touchMoved',
		'touchEnded'
	];

	function playCode(code, elem) {
		function s(p) {
			for (let f of p5functions) {
				code = code.replace('function ' + f + '()', 'p.' + f + ' = function()');
			}
			with (p) eval(code);
		}
		elem.innerHTML = ''; // avoid duplicate canvases
		return new p5(s, elem);
	}

	p5m.minis = [];
	p5m.bases = {};

	class MiniEditor {
		constructor(script, id) {
			let code = script.innerHTML.trim();

			let attrs = script.getAttributeNames();
			let baseIdx = attrs.findIndex((v) => v.startsWith('base-'));
			if (baseIdx != -1) {
				let baseKey = attrs[baseIdx].split('-')[1];
				p5m.bases[baseKey] = code.slice(0, code.lastIndexOf('}'));
			}
			let props = {};
			for (let prop of attrs) {
				props[prop] = script.getAttribute(prop) || true;
			}

			let lines = props.lines || 0;
			if (!lines) {
				for (let c of code) {
					if (c == '\n') lines++;
				}
				lines++;
			}

			this.base = props.base;

			let div = document.createElement('div');
			div.className = 'p5-mini';
			if (props.horiz) div.className += ' horiz';
			else div.className += ' vert';
			div.id = 'p5m-' + id;
			div.style = script.style.cssText;
			script.replaceWith(div);

			let title = document.createElement('div');
			title.className = 'p5m-title';
			let logo = document.createElement('img');
			logo.className = 'p5m-logo';
			logo.src = 'https://p5js.org/assets/img/p5js.svg';
			title.append(logo);
			let span = document.createElement('span');
			span.innerHTML += props.name || props.title || 'sketch';
			title.append(span);
			div.append(title);

			let editBtn = document.createElement('button');
			editBtn.className = 'p5m-edit';
			editBtn.innerHTML = '{ }';
			editBtn.onclick = () => this.editor.focus();
			title.append(editBtn);

			let playBtn = document.createElement('button');
			playBtn.className = 'p5m-play';
			playBtn.onclick = () => this.play();
			title.append(playBtn);

			let main = document.createElement('div');
			main.className = 'p5m-main';
			div.append(main);

			let preview = document.createElement('div');
			preview.className = 'p5m-preview';
			main.append(preview);
			this.preview = preview;

			let ed = document.createElement('div');
			ed.className = 'p5m-editor';
			ed.id = 'p5m-editor-' + id;
			ed.innerHTML = code;
			main.append(ed);

			let editor = ace.edit('p5m-editor-' + id);
			editor.setOptions({
				minLines: 1,
				maxLines: lines,
				showFoldWidgets: false,
				showGutter: props.gutter || false,
				tabSize: 2,
				enableBasicAutocompletion: [
					{
						getCompletions: (editor, session, pos, prefix, callback) => {
							// note, won't fire if caret is at a word that does not have these letters
							callback(null, completions);
						}
					}
				],
				enableLiveAutocompletion: true
			});
			editor.session.on('changeMode', function (e, session) {
				if ('ace/mode/javascript' === session.getMode().$id) {
					if (!!session.$worker) {
						session.$worker.send('setOptions', [
							{
								esversion: 11,
								esnext: false
							}
						]);
					}
				}
			});
			editor.session.setMode('ace/mode/javascript');

			editor.setTheme('ace/theme/xcode');
			editor.session.setUseWrapMode(true);
			editor.renderer.setShowPrintMargin(false);

			this.editor = editor;
			this.sketch = null;

			this.play();
		}

		play() {
			if (this.sketch) this.sketch.remove();
			let code = this.editor.getValue().trim();
			if (!code.includes('function draw')) {
				code = p5m.bases[this.base || 0] + code + '}';
			}
			this.sketch = playCode(code, this.preview);
		}

		reset() {}
	}

	let els = [...document.getElementsByTagName('script')];
	for (let el of els) {
		let head = el.outerHTML.slice(0, 30);
		if (head.includes('text/p5')) {
			p5m.minis.push(new MiniEditor(el, p5m.minis.length));
		}
	}
});
