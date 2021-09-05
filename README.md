# bookmarks-to-json

bookmarksToJSON is a no-dependecy, Regex-based pure JS function that takes in the HTML-style code of the bookmarks files exported by browsers like Chrome and Firefox, and converts them into JSON / JS object format with a recursive tree structure.

Bookmarks, folders and subfolders are nested using a `children` property on the folders.

## usage

`npm i bookmarks-to-json`

```js
import fs from 'fs'
import { bookmarksToJSON } from 'bookmarks-to-json'

const content = fs.readFileSync('bookmarks.html', 'utf-8')
const options = { 
  formatJSON: true, // return prettified JSON - false by default
  spaces: 2 // number of spaces to use for indentation - 2 by default
}
fs.writeFileSync('bookmarks.json', bookmarksToJSON(content, options))
```

```json
bookmarks.json

[
  {
    "type": "link",
    "addDate": 1630524312,
    "title": "GitHub",
    "url": "https://github.com/"
  },
  {
    "type": "folder",
    "addDate": 1630524192,
    "lastModified": 1630524211,
    "title": "Bookmarks bar",
    "children": [
      {
        "type": "link",
        "addDate": 1630524211,
        "title": "Lettuce",
        "url": "https://www.youtube.com/watch?v=M9PAXeKHw7Q"
      }
    ]
  }
]
```

```js
import fs from 'fs'
import { bookmarksToJSON } from 'bookmarks-to-json'

const content = fs.readFileSync('bookmarks.html', 'utf-8')
const options = { stringify: false } // returns JS object, not stringified JSON
console.log(bookmarksToJSON(content, options).map(({ title, type }) => ({ title, type })))

// [
//   { title: 'GitHub', type: 'link' },
//   { title: 'Bookmarks bar', type: 'folder' },
// ]
```

