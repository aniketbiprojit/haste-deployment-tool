// import { useRef, useEffect, useState, RefObject } from 'react'

// import { EditorView, ViewUpdate } from '@codemirror/view'
// import { EditorState } from '@codemirror/state'
// import { json } from '@codemirror/lang-json'
// import { oneDark } from '@codemirror/theme-one-dark'

// class DataHolder {
// 	public static editor: EditorState
// }

// export const CodeMirrorComponent: React.FC<{ ref: RefObject<HTMLDivElement>; initialValue: string }> = ({
// 	initialValue,
// 	ref,
// }) => {
// 	// Local state
// 	const [editorValue, setEditorValue] = useState<string>('')
// 	const [editorTreeValue, setEditorTreeValue] = useState<string[]>([])

// 	// Ref of the editor
// 	const editor = useRef<EditorView>()

// 	// Event listener on editor updates
// 	const onUpdate = () =>
// 		EditorView.updateListener.of((v: ViewUpdate) => {
// 			const doc = v.state.doc

// 			/**
// 			 * # Contenido
// 			 *
// 			 * ```js
// 			 * const x () => {
// 			 *   console.log(45);
// 			 * }
// 			 * ```
// 			 */
// 			const value = doc.toString()
// 			if (value !== editorValue) setEditorValue(value)

// 			/**
// 			 * [
// 			 *   "# Contenido",
// 			 *   "",
// 			 *   "```js",
// 			 *   "const x () => {",
// 			 *   "  console.log(45);",
// 			 *   "}",
// 			 *   "```"
// 			 * ]
// 			 */
// 			let treeArray = new Array()
// 			treeArray = [...doc.toJSON()]

// 			if (treeArray !== editorTreeValue) setEditorTreeValue(treeArray)
// 		})

// 	const getEditorState = () => {
// 		if (DataHolder.editor) {
// 			return DataHolder.editor
// 		} else {
// 			DataHolder.editor = EditorState.create({
// 				doc: initialValue,
// 				extensions: [json(), oneDark, onUpdate()],
// 			})
// 			return DataHolder.editor
// 		}
// 	}
// 	// Initilize view
// 	useEffect(function initEditorView() {
// 		const el = document.getElementById('codemirror-editor-wrapper')

// 		editor.current = new EditorView({
// 			state: getEditorState(),
// 			parent: el as Element,
// 		})
// 	}, [])
// 	useEffect(() => {
// 		setEditorValue(initialValue)
// 	}, [initialValue])

// 	// Component for display text

// 	// Component for display array from editor
// 	// const OutputArray = () => (
// 	// 	<div className='border rounded p-5'>
// 	// 		<pre>
// 	// 			<code>{JSON.stringify(editorTreeValue, null, 2)}</code>
// 	// 		</pre>
// 	// 	</div>
// 	// )

// 	return (
// 		<div>
// 			<div ref={ref} style={{ height: '480px', overflowY: 'scroll' }} className='border w-full rounded p-5'>
// 				<pre>
// 					<code>{editorValue}</code>
// 				</pre>
// 			</div>
// 		</div>
// 	)
// }

export {}
