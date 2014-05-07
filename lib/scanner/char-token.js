/**
 * Created by Epsirom on 14-5-6.
 */

var TokenType = require("./token-types").CharToken;

module.exports = CharToken;

function CharToken(chr) {
    if (!(this instanceof CharToken)) {
        return new CharToken(chr);
    } else {
        this.unitName = TokenType.ERROR;
        this.innerProp = null;
        this.updateByChar(chr);
    }
}

CharToken.prototype.setToken = function(unitName, innerProp) {
    if (typeof unitName != 'number') {
        return;
    }
    this.unitName = unitName;
    if (innerProp !== undefined) {
        this.innerProp = innerProp;
    }
};

CharToken.prototype.updateByChar = function(chr) {
    if (typeof chr != 'string') {
        return;
    }
    this.innerProp = chr;
    if (chr.length < 1) {
        this.unitName = TokenType.TOO_SHORT;
    } else if (chr.length > 1) {
        this.unitName = TokenType.TOO_LONG;
    } else {
        switch (chr) {
            case '@':
                this.unitName = TokenType.TYPE_START;
                break;

            case ' ':
            case '\t':
            case '\r':
            case '\n':
                this.unitName = TokenType.EMPTY_CHAR;
                break;

            case '=':
                this.unitName = TokenType.EQUAL;
                break;

            case ',':
                this.unitName = TokenType.COMMA;
                break;

            case "'":
                this.unitName = TokenType.QUOTE;
                break;

            case '"':
                this.unitName = TokenType.DOUBLE_QUOTE;
                break;

            case '{':
                this.unitName = TokenType.LEFT_BRACE;
                break;

            case '}':
                this.unitName = TokenType.RIGHT_BRACE;
                break;

            default :
                this.unitName = TokenType.COMMON_CHAR;
                break;
        }
    }
};