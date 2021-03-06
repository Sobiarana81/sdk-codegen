/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


import { swapXLookerNullable } from './convert'

describe('spec conversion', () => {
  it('swaps out x-looker-nullable', () => {
    const input = `
"can": {
  "type": "object",
  "additionalProperties": {
    "type": "boolean"
  },
  "readOnly": true,
  "description": "Operations the current user is able to perform on this object",
  "x-looker-nullable": false
},
"content_favorite_id": {
  "type": "integer",
  "format": "int64",
  "readOnly": true,
  "description": "Content Favorite Id",
  "x-looker-nullable": true
},
"content_metadata_id": {
  "type": "integer",
  "format": "int64",
  "readOnly": true,
  "description": "Id of content metadata",
  "x-looker-nullable": true
},
"description": {
  "type": "string",
  "readOnly": true,
  "description": "Description",
  "x-looker-nullable": true
},
"hidden": {
  "type": "boolean",
  "readOnly": true,
  "description": "Is Hidden",
  "x-looker-nullable": false
},
`
    const actual = swapXLookerNullable(input)
    const puzzle = input.replace(/x-looker-nullable/gi, 'nullable')
    expect(actual).toEqual(puzzle)

    expect(actual).toContain('"nullable": true')
    expect(actual).not.toContain('"x-looker-nullable": true')
  })

})
