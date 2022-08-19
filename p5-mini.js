/**
 * p5-mini by @quinton-ashley
 * Embed editable p5.js sketches on your website with p5-mini!
 */
{
	let styles = `
.p5-mini {
	display: flex;
	flex-direction: column;
	border: 2px solid #ccc;
	border-radius: 10px;
	font-family: sans-serif;
}

.p5-mini * {
	outline: none;
}

.p5m-main {
	display: flex;
	align-items: center;
	flex-direction: column;
}

.p5-mini.horiz .p5m-main {
	flex-direction: row;
}

.p5m-title {
	padding: 4px;
	text-align: left;
	border-bottom: 2px solid #ccc;
}

.p5m-title span {
	padding-left: 8px;
	font-weight: bold;
}

.p5m-logo {
	height: 16px;
	margin-top: 2px;
	padding-left: 8px;
	float: left;
}

.p5m-preview {
	display: flex;
	justify-content: center;
}

.p5-mini.vert .p5m-preview {
	width: 100%;
}

.p5m-editor {
	width: 100%;
	font-size: 14px;
}

.p5-mini.vert .p5m-editor {
	border-top: 2px solid #ccc;
}

.p5-mini.horiz .p5m-editor {
	border-left: 2px solid #ccc;
}

.p5m-edit,
.p5m-play {
	float: right;
	border: 0;
	background: transparent;
	cursor: pointer;
}

.p5m-play {
	border-color: transparent transparent transparent #202020;
	border-style: solid;
	border-width: 7px 0 7px 11px;
	margin-top: 1.8px;
	margin-right: -7px;
	border-radius: 2px;
}

.p5m-play:hover {
	border-color: transparent transparent transparent #404040;
}

.p5m-edit {
	color: #202020;
}

.p5m-edit:hover {
	color: #404040;
}

@media screen and (max-width: 1030px) {
	.p5m-editor {
		font-size: 32px;
	}
	.p5m-title {
		font-size: 32px;
		height: 32px;
	}
	.p5m-logo {
		height: 32px;
		padding-right: 4px;
	}
	.p5m-play {
		border-width: 14px 0 14px 18px;
	}
	.p5m-edit {
		font-size: 22px;
	}
}
`;
	let s = document.createElement('style');
	s.innerText = styles;
	document.head.append(s);
}

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
			this.id = id;
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
			script.after(div);
			this.elem = div;

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

			if (props['editor-btn']) {
				let editBtn = document.createElement('button');
				editBtn.className = 'p5m-edit';
				editBtn.innerHTML = '{ }';
				editBtn.onclick = () => {
					this.toggleEditor();
				};
				title.append(editBtn);
			}

			let playBtn = document.createElement('button');
			playBtn.className = 'p5m-play';
			playBtn.onclick = () => this.play();
			title.append(playBtn);

			let main = document.createElement('div');
			main.className = 'p5m-main';
			div.append(main);

			let preview = document.createElement('div');
			preview.id = 'p5m-preview-' + id;
			preview.className = 'p5m-preview';
			main.append(preview);
			this.previewElem = preview;

			let ed = document.createElement('div');
			ed.id = 'p5m-editor-' + id;
			ed.className = 'p5m-editor';
			ed.innerHTML = code;
			main.append(ed);
			this.editorElem = ed;

			let editor = ace.edit('p5m-editor-' + id);
			editor.setOptions({
				minLines: 1,
				maxLines: lines,
				// fontSize: '14px',
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

			if (props['hide-editor']) {
				this.hideEditor();
			}

			this.play();
		}

		play() {
			if (this.sketch) this.sketch.remove();
			let code = this.editor.getValue().trim();
			if (!code.includes('function draw')) {
				code = p5m.bases[this.base || 0] + code + '}';
			}
			this.sketch = playCode(code, this.previewElem);
		}

		toggleEditor() {
			if (this.editorElem.style.display == 'none') {
				this.showEditor();
			} else {
				this.hideEditor();
			}
		}

		showEditor() {
			let ed = this.editorElem;
			let pr = this.previewElem;
			ed.style.display = 'block';
			pr.style.width = 'unset';
			this.editor.focus();
		}

		hideEditor() {
			let ed = this.editorElem;
			let pr = this.previewElem;
			pr.style.width = '100%';
			ed.style.display = 'none';
		}

		remove() {
			this.sketch.remove();
			this.editor.destroy();
			this.editor.container.remove();
			this.elem.remove();
		}
	}

	p5m.loadMinis = function (elem) {
		elem = elem || document;
		let els = [...elem.getElementsByTagName('script')];
		for (let el of els) {
			let head = el.outerHTML.slice(0, 30);
			if (head.includes('text/p5')) {
				p5m.minis.push(new MiniEditor(el, p5m.minis.length));
			}
		}
	};

	if (p5m.autoLoad !== false) p5m.autoLoad = true;
	if (p5m.autoLoad) p5m.loadMinis();

	if (p5m.ready) p5m.ready();
});
