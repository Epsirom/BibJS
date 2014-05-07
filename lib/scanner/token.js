/**
 * Created by Epsirom on 14-5-6.
 */

var TokenType = require("./token-types").Token;

module.exports = Token;

function Token() {
    if (!(this instanceof Token)) {
        return new Token();
    } else {
        this.unitName = TokenType.ERROR;
        this.innerProp = null;
    }
}

Token.prototype.setToken = function(unitName, innerProp) {
    if (typeof unitName != 'number') {
        return;
    }
    this.unitName = unitName;
    if (innerProp !== undefined) {
        this.innerProp = innerProp;
    }
};

Token.prototype.setProp = function(innerProp) {
    this.innerProp = innerProp;
};
