import {
    describe,
    it
} from 'mocha';

import {
    createReadStream
} from 'fs';

import {
    expect
} from 'chai';

import {
    join
} from 'path';

import Slexer from '../js/slexer';

import {
    Transform
} from 'stream';

describe('Slexer', () => {
    it('should be a constructor function', () => {
        expect(Slexer).to.be.a('function');

        const slexer = new Slexer();

        expect(slexer).to.be.an('object');
        expect(slexer).to.be.an.instanceOf(Slexer);
        expect(slexer).to.be.an.instanceOf(Transform);
    });

    it('should be a facory function', () => {
        expect(Slexer).to.be.a('function');

        const slexer = Slexer();

        expect(slexer).to.be.an('object');
        expect(slexer).to.be.an.instanceOf(Slexer);
        expect(slexer).to.be.an.instanceOf(Transform);
    });

    it('should lex text', callbackFunction => {
        const slexer = Slexer({
                lexicon: [
                    'a',
                    'e',
                    'i',
                    'o',
                    'u'
                ]
            }),
            tokens = [];

        slexer.on('readable', () => {
            let token = slexer.read();

            while (token) {
                tokens.push(token);

                if (!token.end) {
                    token = slexer.read();
                    continue;
                }

                expect(tokens).to.deep.equal([{
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
                }]);

                callbackFunction();
                return;
            }
        });

        slexer.end('abcdefghijklmnopqrstuvwxyz');
    });

    it('should handle lexemes that are a superset of other lexemes', callbackFunction => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFG'.split(''),
            slexer = Slexer({
                lexicon: alphabet.slice(0, 26).reduce((lexicon, character, index) => {
                    for (let i = 1; i <= 8; i += 1) {
                        const fragment = alphabet.slice(index, index + i).join('');

                        lexicon.push(fragment, fragment.toLowerCase());
                    }
                    return lexicon;
                }, [])
            }),
            tokens = [];

        slexer.on('readable', () => {
            let token = slexer.read();

            while (token) {
                tokens.push(token);

                if (!token.end) {
                    token = slexer.read();
                    continue;
                }

                expect(tokens).to.deep.equal([{
                    column: 0,
                    lexeme: 'ab',
                    line: 0,
                    offset: 0
                }, {
                    column: 2,
                    lexeme: 'ABCD',
                    line: 0,
                    offset: 2
                }, {
                    column: 6,
                    lexeme: 'abcdef',
                    line: 0,
                    offset: 6
                }, {
                    column: 12,
                    lexeme: 'ABCDEFGH',
                    line: 0,
                    offset: 12
                }, {
                    column: 20,
                    lexeme: 'abcdefgh',
                    line: 0,
                    offset: 20
                }, {
                    column: 28,
                    lexeme: 'ij',
                    line: 0,
                    offset: 28
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 0,
                    offset: 30
                }, {
                    column: 0,
                    lexeme: 'CD',
                    line: 1,
                    offset: 31
                }, {
                    column: 2,
                    lexeme: 'efgh',
                    line: 1,
                    offset: 33
                }, {
                    column: 6,
                    lexeme: 'GHIJKL',
                    line: 1,
                    offset: 37
                }, {
                    column: 12,
                    lexeme: 'ijklmnop',
                    line: 1,
                    offset: 43
                }, {
                    column: 20,
                    lexeme: 'KLMNOPQR',
                    line: 1,
                    offset: 51
                }, {
                    column: 28,
                    lexeme: 'ST',
                    line: 1,
                    offset: 59
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 1,
                    offset: 61
                }, {
                    column: 0,
                    lexeme: 'ef',
                    line: 2,
                    offset: 62
                }, {
                    column: 2,
                    lexeme: 'IJKL',
                    line: 2,
                    offset: 64
                }, {
                    column: 6,
                    lexeme: 'mnopqr',
                    line: 2,
                    offset: 68
                }, {
                    column: 12,
                    lexeme: 'QRSTUVWX',
                    line: 2,
                    offset: 74
                }, {
                    column: 20,
                    lexeme: 'uvwxyzab',
                    line: 2,
                    offset: 82
                }, {
                    column: 28,
                    lexeme: 'cd',
                    line: 2,
                    offset: 90
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 2,
                    offset: 92
                }, {
                    column: 0,
                    lexeme: 'GH',
                    line: 3,
                    offset: 93
                }, {
                    column: 2,
                    lexeme: 'mnop',
                    line: 3,
                    offset: 95
                }, {
                    column: 6,
                    lexeme: 'STUVWX',
                    line: 3,
                    offset: 99
                }, {
                    column: 12,
                    lexeme: 'yzabcdef',
                    line: 3,
                    offset: 105
                }, {
                    column: 20,
                    lexeme: 'EFGHIJKL',
                    line: 3,
                    offset: 113
                }, {
                    column: 28,
                    lexeme: 'MN',
                    line: 3,
                    offset: 121
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 3,
                    offset: 123
                }, {
                    column: 0,
                    lexeme: 'ij',
                    line: 4,
                    offset: 124
                }, {
                    column: 2,
                    lexeme: 'QRST',
                    line: 4,
                    offset: 126
                }, {
                    column: 6,
                    lexeme: 'yzabcd',
                    line: 4,
                    offset: 130
                }, {
                    column: 12,
                    lexeme: 'GHIJKLMN',
                    line: 4,
                    offset: 136
                }, {
                    column: 20,
                    lexeme: 'opqrstuv',
                    line: 4,
                    offset: 144
                }, {
                    column: 28,
                    lexeme: 'wx',
                    line: 4,
                    offset: 152
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 4,
                    offset: 154
                }, {
                    column: 0,
                    lexeme: 'KL',
                    line: 5,
                    offset: 155
                }, {
                    column: 2,
                    lexeme: 'uvwx',
                    line: 5,
                    offset: 157
                }, {
                    column: 6,
                    lexeme: 'EFGHIJ',
                    line: 5,
                    offset: 161
                }, {
                    column: 12,
                    lexeme: 'opqrstuv',
                    line: 5,
                    offset: 167
                }, {
                    column: 20,
                    lexeme: 'YZABCDEF',
                    line: 5,
                    offset: 175
                }, {
                    column: 28,
                    lexeme: 'GH',
                    line: 5,
                    offset: 183
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 5,
                    offset: 185
                }, {
                    column: 0,
                    lexeme: 'mn',
                    line: 6,
                    offset: 186
                }, {
                    column: 2,
                    lexeme: 'YZAB',
                    line: 6,
                    offset: 188
                }, {
                    column: 6,
                    lexeme: 'klmnop',
                    line: 6,
                    offset: 192
                }, {
                    column: 12,
                    lexeme: 'WXYZABCD',
                    line: 6,
                    offset: 198
                }, {
                    column: 20,
                    lexeme: 'ijklmnop',
                    line: 6,
                    offset: 206
                }, {
                    column: 28,
                    lexeme: 'qr',
                    line: 6,
                    offset: 214
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 6,
                    offset: 216
                }, {
                    column: 0,
                    lexeme: 'OP',
                    line: 7,
                    offset: 217
                }, {
                    column: 2,
                    lexeme: 'cdef',
                    line: 7,
                    offset: 219
                }, {
                    column: 6,
                    lexeme: 'QRSTUV',
                    line: 7,
                    offset: 223
                }, {
                    column: 12,
                    lexeme: 'efghijkl',
                    line: 7,
                    offset: 229
                }, {
                    column: 20,
                    lexeme: 'STUVWXYZ',
                    line: 7,
                    offset: 237
                }, {
                    column: 28,
                    lexeme: 'AB',
                    line: 7,
                    offset: 245
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 7,
                    offset: 247
                }, {
                    column: 0,
                    lexeme: 'qr',
                    line: 8,
                    offset: 248
                }, {
                    column: 2,
                    lexeme: 'GHIJ',
                    line: 8,
                    offset: 250
                }, {
                    column: 6,
                    lexeme: 'wxyzab',
                    line: 8,
                    offset: 254
                }, {
                    column: 12,
                    lexeme: 'MNOPQRST',
                    line: 8,
                    offset: 260
                }, {
                    column: 20,
                    lexeme: 'cdefghij',
                    line: 8,
                    offset: 268
                }, {
                    column: 28,
                    lexeme: 'kl',
                    line: 8,
                    offset: 276
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 8,
                    offset: 278
                }, {
                    column: 0,
                    lexeme: 'ST',
                    line: 9,
                    offset: 279
                }, {
                    column: 2,
                    lexeme: 'klmn',
                    line: 9,
                    offset: 281
                }, {
                    column: 6,
                    lexeme: 'CDEFGH',
                    line: 9,
                    offset: 285
                }, {
                    column: 12,
                    lexeme: 'uvwxyzab',
                    line: 9,
                    offset: 291
                }, {
                    column: 20,
                    lexeme: 'MNOPQRST',
                    line: 9,
                    offset: 299
                }, {
                    column: 28,
                    lexeme: 'UV',
                    line: 9,
                    offset: 307
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 9,
                    offset: 309
                }, {
                    column: 0,
                    lexeme: 'uv',
                    line: 10,
                    offset: 310
                }, {
                    column: 2,
                    lexeme: 'OPQR',
                    line: 10,
                    offset: 312
                }, {
                    column: 6,
                    lexeme: 'ijklmn',
                    line: 10,
                    offset: 316
                }, {
                    column: 12,
                    lexeme: 'CDEFGHIJ',
                    line: 10,
                    offset: 322
                }, {
                    column: 20,
                    lexeme: 'wxyzabcd',
                    line: 10,
                    offset: 330
                }, {
                    column: 28,
                    lexeme: 'ef',
                    line: 10,
                    offset: 338
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 10,
                    offset: 340
                }, {
                    column: 0,
                    lexeme: 'WX',
                    line: 11,
                    offset: 341
                }, {
                    column: 2,
                    lexeme: 'stuv',
                    line: 11,
                    offset: 343
                }, {
                    column: 6,
                    lexeme: 'OPQRST',
                    line: 11,
                    offset: 347
                }, {
                    column: 12,
                    lexeme: 'klmnopqr',
                    line: 11,
                    offset: 353
                }, {
                    column: 20,
                    lexeme: 'GHIJKLMN',
                    line: 11,
                    offset: 361
                }, {
                    column: 28,
                    lexeme: 'OP',
                    line: 11,
                    offset: 369
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 11,
                    offset: 371
                }, {
                    column: 0,
                    lexeme: 'yz',
                    line: 12,
                    offset: 372
                }, {
                    column: 2,
                    lexeme: 'WXYZ',
                    line: 12,
                    offset: 374
                }, {
                    column: 6,
                    lexeme: 'uvwxyz',
                    line: 12,
                    offset: 378
                }, {
                    column: 12,
                    lexeme: 'STUVWXYZ',
                    line: 12,
                    offset: 384
                }, {
                    column: 20,
                    lexeme: 'qrstuvwx',
                    line: 12,
                    offset: 392
                }, {
                    column: 28,
                    lexeme: 'yz',
                    line: 12,
                    offset: 400
                }, {
                    column: 30,
                    lexeme: '\n',
                    line: 12,
                    offset: 402
                }, {
                    end: true
                }]);

                callbackFunction();
                return;
            }
        });

        createReadStream(join(__dirname, 'documents', 'alphabet.txt')).pipe(slexer);
    });
});
