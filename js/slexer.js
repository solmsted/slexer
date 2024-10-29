import _later from 'isotropic-later';
import _make from 'isotropic-make';
import _stream from 'node:stream';

export default _make(_stream.Transform, {
    _flush (callbackFunction) {
        if (this._remainder) {
            this._lex(this._remainder)._remainder = '';
        } else {
            this.push({
                end: true
            });
        }

        _later.asap(callbackFunction);
    },
    _init ({
        lexicon = [],
        lineEnding = '\n'
    } = {}) {
        let maximumLexemeLength = 0;

        this._lexRegex = new RegExp(`((?:${lexicon.map(lexeme => {
            if (lexeme.length > maximumLexemeLength) {
                maximumLexemeLength = lexeme.length;
            }

            return lexeme.replace(/[$\(\)*+.\/?\[\\\]^\{\|\}]/gv, '\\$&');
        }).sort((a, b) => b.length - a.length).join(')|(?:')}))`, 'gv');

        this._line = 0;

        this._lineEnding = lineEnding;

        this._lineOffset = 0;

        this._maximumLexemeLength = maximumLexemeLength;

        this._offset = 0;

        this._remainder = '';

        Reflect.apply(_stream.Transform, this, [{
            decodeStrings: true,
            objectMode: true
        }]);

        return this;
    },
    _lex (text, incomplete) {
        let advance = true,
            offset = 0;

        text.replace(this._lexRegex, (match, lexeme, lexemeOffset) => {
            if (advance) {
                if (offset !== lexemeOffset) {
                    const inBetweenLexeme = text.substr(offset, lexemeOffset - offset),
                        totalOffset = this._offset + offset;

                    this.push({
                        column: totalOffset - this._lineOffset,
                        lexeme: inBetweenLexeme,
                        line: this._line,
                        offset: totalOffset
                    });

                    let lineEndingIndex = inBetweenLexeme.indexOf(this._lineEnding);

                    while (lineEndingIndex !== -1) {
                        this._line += 1;

                        const lexemeLineOffset = lineEndingIndex + this._lineEnding.length;

                        this._lineOffset = totalOffset + lexemeLineOffset;
                        lineEndingIndex = inBetweenLexeme.indexOf(this._lineEnding, lexemeLineOffset);
                    }
                }

                const totalOffset = this._offset + lexemeOffset;

                this.push({
                    column: totalOffset - this._lineOffset,
                    lexeme,
                    line: this._line,
                    offset: totalOffset
                });

                let lineEndingIndex = lexeme.indexOf(this._lineEnding);

                while (lineEndingIndex !== -1) {
                    this._line += 1;

                    const lexemeLineOffset = lineEndingIndex + this._lineEnding.length;

                    this._lineOffset = totalOffset + lexemeLineOffset;
                    lineEndingIndex = lexeme.indexOf(this._lineEnding, lexemeLineOffset);
                }

                offset = lexemeOffset + lexeme.length;

                if (incomplete) {
                    const remainingTextLength = text.length - offset;

                    if (remainingTextLength && remainingTextLength < this._maximumLexemeLength) {
                        advance = false;
                        this._remainder = text.substr(-remainingTextLength);
                    }
                }
            }

            return '';
        });

        if (advance) {
            const remainingTextLength = text.length - offset;

            if (remainingTextLength > 0) {
                const totalOffset = this._offset + offset;

                this.push({
                    column: totalOffset - this._lineOffset,
                    lexeme: text.substr(-remainingTextLength),
                    line: this._line,
                    offset: totalOffset
                });
            }
        }

        this._offset += offset;

        if (!incomplete) {
            this.push({
                end: true
            });
        }

        return this;
    },
    _transform (chunk, encoding, callbackFunction) {
        let text = chunk.toString();

        if (this._remainder) {
            text = this._remainder + text;
            this._remainder = '';
        }

        this._lex(text, true);
        _later.asap(callbackFunction);
    }
});
