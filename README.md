Slexer
======

A simple streamable lexer.  It transforms text into token objects.

Description
-----------

Slexer will take text and break it up into individual token objects based upon a
given lexicon.  There will be one token for each portion of text that matches an
item in the lexicon.  There will also be one token for each portion of text that
does not match an item in the lexicon.  This way the entire length of text will
be represented by tokens.  The tokens will contain the matched or unmatched
portion of text, called the lexeme, along with positional information where the
lexeme was found in the text.  For example, given the text
`'abcdefghijklmnopqrstuvwxyz'` and the lexicon `['a', 'e', 'i', 'o', 'u']`,
Slexer will produce the following tokens:

```js
[{
    column: 0,
    lexeme: 'a',
    line: 0,
    offset: 0
}, {
    column: 1,
    lexeme: 'bcd',
    line: 0,
    offset: 1
}, {
    column: 4,
    lexeme: 'e',
    line: 0,
    offset: 4
}, {
    column: 5,
    lexeme: 'fgh',
    line: 0,
    offset: 5
}, {
    column: 8,
    lexeme: 'i',
    line: 0,
    offset: 8
}, {
    column: 9,
    lexeme: 'jklmn',
    line: 0,
    offset: 9
}, {
    column: 14,
    lexeme: 'o',
    line: 0,
    offset: 14
}, {
    column: 15,
    lexeme: 'pqrst',
    line: 0,
    offset: 15
}, {
    column: 20,
    lexeme: 'u',
    line: 0,
    offset: 20
}, {
    column: 21,
    lexeme: 'vwxyz',
    line: 0,
    offset: 21
}, {
    end: true
}]
```

The final token is unique in order to mark the end of the text.

Usage
-----

Begin by requiring the `slexer` module.

```js
var Slexer = require('slexer').Slexer;
```

The Slexer constructor requires an options object with a `lexicon` property.
The lexicon is defined by an array of strings.  For optimal performance, the
lexicon should not contain duplicates.

```js
var slexer = new Slexer({
    lexicon: [
        'this',
        'is',
        'an',
        'array',
        'of',
        'strings',
        'to',
        'match'
    ]
});
```

By default, Slexer uses `'\n'` to identify line endings.  This can be overridden
by specifying a `lineEnding` property on the options object.

Slexer is a `Readable` stream.  When the stream becomes readable, tokens can be
obtained through the `read` method.

```js
slexer.on('readable', function () {
    var token = slexer.read();

    // token will be null when the stream is no longer readable.  If the stream
    // has not ended, the readable event will be fired again later and reading
    // will resume.
    while (token) {
        console.log(token);
        token = slexer.read();
    }
});
```

Slexer is also a `Writable` stream.  The input text can be written to the stream
using the `write` method.  Calling the `end` method will signal the end of the
input text.  A more common use case is to read text from an input file.  In this
case, it is recommended to create a `Readable` stream to read the file and pipe
its output into Slexer.

```js
require('fs').createReadStream('path/to/file').pipe(slexer);
```

If you happen to already have a string containing the entire input text, you can
pass it to the `end` method to simultaneously write and close the stream.

```js
slexer.end(text);
```

The Name
--------

The `S` in Slexer might stand for any or all of the following:

* Simple
* Slexer
* Slexy
* Small
* Smart
* Smooth
* Soft
* Spectacular
* Speedy
* Splendid
* Steven's
* Streamable
* Streamy
* Stupendous
* Super
* Swell
* Swift

License
-------

Copyright (c) 2013 Steven Olmsted <steven.olm@gmail.com>

This software is provided "as is", without any express or implied warranties,
including but not limited to the implied warranties of merchantability and
fitness for a particular purpose.  In no event will the authors or contributors
be held liable for any direct, indirect, incidental, special, exemplary, or
consequential damages however caused and on any theory of liability, whether in
contract, strict liability, or tort (including negligence or otherwise), arising
in any way out of the use of this software, even if advised of the possibility
of such damage.

Permission is granted to anyone to use this software for any purpose, including
commercial applications, and to alter and distribute it freely in any form,
provided that the following conditions are met:

1. The origin of this software must not be misrepresented; you must not claim
   that you wrote the original software.  If you use this software in a product,
   an acknowledgment in the product documentation would be appreciated but is
   not required.

2. Altered source versions may not be misrepresented as being the original
   software, and neither the name of Steven Olmsted nor the names of authors or
   contributors may be used to endorse or promote products derived from this
   software without specific prior written permission.

3. This notice must be included, unaltered, with any source distribution.