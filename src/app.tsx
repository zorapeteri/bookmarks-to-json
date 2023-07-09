import { useEffect, useRef, useState } from 'preact/hooks'
import usePrefersColorScheme from 'use-prefers-color-scheme'
import { FileUploader } from 'react-drag-drop-files'
import './app.css'
import { readFile } from './readFile'
import { EditorView, basicSetup } from 'codemirror'
import { json } from '@codemirror/lang-json'
import { EditorState } from '@codemirror/state'
import { classname } from './classname'
import { InlineIcon } from '@iconify/react'
// @ts-ignore
import { bookmarksToJSON } from 'bookmarks-to-json'
// @ts-ignore
import { tokyoNight } from '@ddietr/codemirror-themes/tokyo-night'
// @ts-ignore
import { tokyoNightDay } from '@ddietr/codemirror-themes/tokyo-night-day'

export function App() {
  const [dragging, setDragging] = useState(false)
  const [bookmarks, setBookmarks] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [firstFileName, setFirstFileName] = useState<string | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const [editor, setEditor] = useState<EditorView | null>(null)
  const colorScheme = usePrefersColorScheme()

  const getPreExistingBookmarks = () => {
    if (!bookmarks) return {}
    if (Array.isArray(bookmarks) && firstFileName) {
      return { [firstFileName]: bookmarks }
    }
    return bookmarks
  }

  const handleChange = async (files: any) => {
    if (!bookmarks && files.length === 1) {
      const content = await readFile(files[0])
      setBookmarks(bookmarksToJSON(content, { stringify: false }))
      setFirstFileName(files[0].name.replace(/\.html/gi, ''))
      return
    }

    const contents = await Promise.all(
      Array.from(files).map((file) => readFile(file))
    )

    setBookmarks(
      Array.from(files).reduce(
        (acc: any, file: any, index) => ({
          ...acc,
          [file.name.replace(/\.html/gi, '')]: bookmarksToJSON(
            contents[index],
            { stringify: false }
          ),
        }),
        getPreExistingBookmarks()
      )
    )
  }

  useEffect(() => {
    if (bookmarks && editorContainerRef.current) {
      editorContainerRef.current.firstChild?.remove()

      const editor = new EditorView({
        doc: JSON.stringify(bookmarks, null, 2),
        extensions: [
          basicSetup,
          json(),
          EditorState.readOnly.of(true),
          colorScheme === 'light' ? tokyoNightDay : tokyoNight,
        ],
        parent: editorContainerRef.current,
      })
      setEditor(editor)
    }
  }, [bookmarks, editorContainerRef])

  return (
    <div {...classname('wrapper', editor && 'has-editor')}>
      <h1>Convert browser bookmarks to JSON</h1>
      {!bookmarks && (
        <FileUploader
          multiple
          handleChange={handleChange}
          name="file"
          types={['HTML']}
          onDraggingStateChange={setDragging}
          hoverTitle={' '}
          classes={['upload']}
        >
          {dragging ? (
            'Drop here'
          ) : (
            <>
              <span>Upload bookmarks</span>
              <small>or drop files here</small>
            </>
          )}
        </FileUploader>
      )}
      {bookmarks && (
        <>
          <div className="buttons-container">
            <button
              style={{ minWidth: '148px' }}
              onClick={(e) => {
                const target = e.target as HTMLElement
                if (!target) return
                navigator.clipboard
                  .writeText(JSON.stringify(bookmarks, null, 2))
                  .then(() => {
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1300)
                  })
              }}
            >
              <InlineIcon icon={copied ? 'ic:round-check' : 'uil:copy'} />
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
            <FileUploader
              multiple
              handleChange={handleChange}
              name="file"
              types={['HTML']}
              onDraggingStateChange={setDragging}
              hoverTitle={' '}
              classes={['more']}
            >
              {dragging ? (
                'Drop here'
              ) : (
                <>
                  <InlineIcon icon="charm:plus" />
                  Add more bookmarks
                </>
              )}
            </FileUploader>
            <button onClick={() => location.reload()}>
              <InlineIcon icon="prime:refresh" />
              Start over
            </button>
          </div>
          <div className="codemirror-container" ref={editorContainerRef} />
        </>
      )}
    </div>
  )
}
