/*
@module slexer
@author Steven Olmsted <steven.olm@gmail.com>
*/

'use strict';

/*
@class Slexer
@constructor
@extends stream.Transform
@param {Object} options
@param {String[]} options.lexicon
@param {String} [options.lineEnding='\n']
*/
var _Class = function () {
    this._initializer.apply(this, arguments);
};

require('util').inherits(_Class, require('stream').Transform);

/**
@method _flush
@param {Function} callbackFunction
@protected
*/
_Class.prototype._flush = function (callbackFunction) {
    var me = this,
        remainder = me._remainder;

    if (remainder) {
        delete me._lex(remainder)._remainder;
    } else {
        me.push({
            end: true
        });
    }

    callbackFunction();
};

/**
@method _initializer
@param {Object} options
@protected
*/
_Class.prototype._initializer = function (options) {
    var maximumLexemeLength = 0,
        me = this;

    /**
    @property _lexRegex
    @protected
    @type RegExp
    */
    me._lexRegex = new RegExp('((?:' + options.lexicon.map(function (lexeme) {
        var lexemeLength = lexeme.length;

        if (lexemeLength > maximumLexemeLength) {
            maximumLexemeLength = lexemeLength;
        }

        return lexeme.replace(/[$()*+-./?[\\\]^{|}]/g, '\\$&');
    }).sort(function (a, b) {
        return b.length - a.length;
    }).join(')|(?:') + '))', 'g');

    /**
    @property _line
    @protected
    @type Number
    */
    me._line = 0;

    /**
    @property _lineEnding
    @protected
    @type String
    */
    me._lineEnding = options.lineEnding || '\n';

    /**
    @property _lineOffset
    @protected
    @type Number
    */
    me._lineOffset = 0;

    /**
    @property _maximumLexemeLength
    @protected
    @type Number
    */
    me._maximumLexemeLength = maximumLexemeLength;

    /**
    @property _offset
    @protected
    @type Number
    */
    me._offset = 0;

    /**
    @property _remainder
    @protected
    @type String
    */

    delete options.lexicon;
    options.decodeStrings = true;
    options.objectMode = true;

    _Class.super_.call(me, options);
};

/*
@method _lex
@chainable
@param {String} text
@param {Boolean} [incomplete=false]
@protected
*/
_Class.prototype._lex = function (text, incomplete) {
    var me = this,

        advance = true,
        line = me._line,
        lineEnding = me._lineEnding,
        lineEndingLength = lineEnding.length,
        lineOffset = me._lineOffset,
        maximumLexemeLength = me._maximumLexemeLength,
        offset = 0,
        remainingTextLength,
        textOffset = me._offset,
        textLength = text.length;

    text.replace(me._lexRegex, function (match, lexeme, lexemeOffset) {
        if (advance) {
            var inBetweenLexeme,
                lexemeLineOffset,
                lineEndingIndex,
                totalOffset;

            if (offset !== lexemeOffset) {
                inBetweenLexeme = text.substr(offset, lexemeOffset - offset);
                totalOffset = textOffset + offset;

                me.push({
                    column: totalOffset - lineOffset,
                    lexeme: inBetweenLexeme,
                    line: line,
                    offset: totalOffset
                });

                lineEndingIndex = inBetweenLexeme.indexOf(lineEnding);

                while (lineEndingIndex !== -1) {
                    line += 1;

                    lexemeLineOffset = lineEndingIndex + lineEndingLength;
                    lineOffset = totalOffset + lexemeLineOffset;
                    lineEndingIndex = inBetweenLexeme.indexOf(lineEnding, lexemeLineOffset);
                }
            }

            totalOffset = textOffset + lexemeOffset;

            me.push({
                column: totalOffset - lineOffset,
                lexeme: lexeme,
                line: line,
                offset: totalOffset
            });

            lineEndingIndex = lexeme.indexOf(lineEnding);

            while (lineEndingIndex !== -1) {
                line += 1;

                lexemeLineOffset = lineEndingIndex + lineEndingLength;
                lineOffset = totalOffset + lexemeLineOffset;
                lineEndingIndex = lexeme.indexOf(lineEnding, lexemeLineOffset);
            }

            offset = lexemeOffset + lexeme.length;

            if (incomplete) {
                remainingTextLength = textLength - offset;

                if (remainingTextLength && remainingTextLength < maximumLexemeLength) {
                    advance = false;
                    me._remainder = text.substr(-remainingTextLength);
                }
            }
        }

        return '';
    });

    if (advance) {
        remainingTextLength = textLength - offset;

        if (remainingTextLength > 0) {
            me.push({
                column: offset - lineOffset,
                lexeme: text.substr(-remainingTextLength),
                line: line,
                offset: offset
            });
        }
    }

    me._line = line;
    me._lineOffset = lineOffset;
    me._offset += offset;

    if (!incomplete) {
        me.push({
            end: true
        });
    }

    return me;
};

/**
@method _transform
@param {Buffer} chunk
@param {String} encoding
@param {Function} callbackFunction
@protected
*/
_Class.prototype._transform = function (chunk, encoding, callbackFunction) {
    var me = this,
        remainder = me._remainder,
        text = chunk.toString();

    if (remainder) {
        text = remainder + text;
        delete me._remainder;
    }

    me._lex(text, true);
    callbackFunction();
};

module.exports = _Class;