/**
 * Created by Epsirom on 14-5-6.
 */


module.exports = BibDad;

var Scanner = require('./scanner/scanner');
var Automata = require('./automata/runner');
var AutomataData = require('./automata/inner-data');
var TokenTypes = require('./scanner/token-types');
var TokenType = TokenTypes.Token;

function make_object() {
    var rtn = {};
    for (var i = 0, len = arguments.length; i < len; i += 2) {
        rtn[arguments[i]] = arguments[i + 1];
    }
    return rtn;
}

var tokenTypeKeyMap = make_object(
    TokenType.CITE_NAME, 'cite_name',
    TokenType.AUTHOR, 'author',
    TokenType.TITLE, 'title',
    TokenType.BOOKTITLE, 'booktitle',
    TokenType.YEAR, 'year',
    TokenType.EDITOR, 'editor',
    TokenType.VOLUME, 'volume',
    TokenType.NUMBER, 'number',
    TokenType.SERIES, 'series',
    TokenType.PAGES, 'pages',
    TokenType.ADDRESS, 'address',
    TokenType.MONTH, 'month',
    TokenType.ORGANIZATION, 'organization',
    TokenType.PUBLISHER, 'publisher',
    TokenType.NOTE, 'note',
    TokenType.KEY, 'key',
    TokenType.UNSUPPORT_LABEL, 'unsupported'
);

var requiredMap = make_object(
    TokenType.INPROCEEDINGS, [TokenType.AUTHOR, TokenType.TITLE, TokenType.BOOKTITLE, TokenType.YEAR],
    TokenType.PROCEEDINGS, [TokenType.TITLE, TokenType.YEAR]
);

var optionalMap = make_object(
    TokenType.INPROCEEDINGS, [
        TokenType.EDITOR, [TokenType.VOLUME, TokenType.NUMBER], TokenType.SERIES, TokenType.PAGES,
        TokenType.ADDRESS, TokenType.MONTH, TokenType.ORGANIZATION, TokenType.PUBLISHER, TokenType.NOTE, TokenType.KEY
    ],
    TokenType.PROCEEDINGS, [
        TokenType.EDITOR, [TokenType.VOLUME, TokenType.NUMBER], TokenType.SERIES,
        TokenType.ADDRESS, TokenType.MONTH, TokenType.PUBLISHER, TokenType.NOTE, TokenType.KEY
    ]
);

function BibDad() {
    if (!(this instanceof BibDad)) {
        return new BibDad();
    } else {
        this.scanner = Scanner();
        this.bibtype = null;
        this.data = {};
        this.automata = Automata();
        var dt = AutomataData();
        dt.addNode('init', dt.genNext(
            TokenType.CONFERENCE, 'type_ready',
            TokenType.PROCEEDINGS, 'type_ready',
            TokenType.INPROCEEDINGS, 'type_ready',
            TokenType.UNSUPPORT_TYPE, 'type_ready'
        ), false, 0);
        dt.addNode('type_ready', dt.genNext(
            TokenType.LEFT_BRACE, 'processing'
        ), false, 0);
        dt.addNode('processing', dt.genNext(
            TokenType.CITE_NAME, 'processing',
            TokenType.AUTHOR, 'processing',
            TokenType.TITLE, 'processing',
            TokenType.BOOKTITLE, 'processing',
            TokenType.YEAR, 'processing',
            TokenType.EDITOR, 'processing',
            TokenType.VOLUME, 'processing',
            TokenType.NUMBER, 'processing',
            TokenType.SERIES, 'processing',
            TokenType.PAGES, 'processing',
            TokenType.ADDRESS, 'processing',
            TokenType.MONTH, 'processing',
            TokenType.ORGANIZATION, 'processing',
            TokenType.PUBLISHER, 'processing',
            TokenType.NOTE, 'processing',
            TokenType.KEY, 'processing',
            TokenType.UNSUPPORT_LABEL, 'processing',
            TokenType.RIGHT_BRACE, 'finish'
        ), false, 0);
        dt.addNode('finish', {}, true, 0);
        dt.setStart('init');
        this.automata.setData(dt);
    }
}

BibDad.prototype.loadStr = function(str) {
    if (str === undefined || str === null) {
        str = '';
    }
    this.scanner.str = str.toString();
};

BibDad.prototype.pointerReset = function() {
    this.scanner.pointer = 0;
};

BibDad.prototype.reset = function() {
    this.data = {};
};

function replaceAndWithComma(str) {
    var result = '';
    var buffer = '';
    var current = 0;
    for (var i = 0, len = str.length; i < len; ++i) {
        switch (current) {
            case 0:
                switch (str[i]) {
                    case ' ':
                        current = 1;
                        break;

                    default :
                        result += str[i];
                }
                break;

            case 1:
                switch (str[i]) {
                    case ' ':
                        result += ' ';
                        break;

                    case 'a':
                        current = 2;
                        break;

                    default :
                        current = 0;
                        result += ' ';
                        result += str[i];
                }
                break;

            case 2:
                switch (str[i]) {
                    case ' ':
                        result += ' a';
                        current = 1;
                        break;

                    case 'n':
                        current = 3;
                        break;

                    default :
                        current = 0;
                        result += ' a';
                        result += str[i];
                }
                break;

            case 3:
                switch (str[i]) {
                    case ' ':
                        result += ' an';
                        current = 1;
                        break;

                    case 'd':
                        current = 4;
                        break;

                    default :
                        current = 0;
                        result += ' an';
                        result += str[i];
                }
                break;

            case 4:
                switch (str[i]) {
                    case ' ':
                        result += ', ';
                        current = 0;
                        break;

                    default :
                        result += ' and';
                        current = 0;
                        result += str[i];
                }
                break;

            default :
                console.log('ERROR!!!!!!!!!!!!!!');
                return '';
        }
    }
    return result;
}

BibDad.prototype.analyze = function() {
    this.automata.restart();
    do {
        this.scanner.scan();
        if (this.scanner.token.unitName >= 0) {
            if (!this.automata.executeOnce(this.scanner.token.unitName)) {
                return false;
            }
            switch (this.automata.current()) {
                case 'type_ready':
                    this.bibtype = this.scanner.token.unitName;
                    break;

                case 'processing':
                    if (this.scanner.token.unitName == TokenType.AUTHOR) {
                        this.data[tokenTypeKeyMap[TokenType.AUTHOR]] = replaceAndWithComma(this.scanner.token.innerProp);
                    } else {
                        this.data[tokenTypeKeyMap[this.scanner.token.unitName]] = this.scanner.token.innerProp;
                    }
                    break;
            }
        }
    } while (this.scanner.token.unitName >= 0 && !(this.automata.isAccept()));
    return (this.automata.isAccept() && !(this.scanner.token.unitName == TokenType.NO_MORE));
};

BibDad.prototype.validate = function() {
    if (!(requiredMap[this.bibtype] instanceof Array)) {
        return false;
    }
    var requires = requiredMap[this.bibtype];
    for (var i = 0, len = requires.length; i < len; ++i) {
        if (requires[i] instanceof Array) {
            var flag = false;
            for (var j = 0, jlen = requires[i].length; j < jlen; ++j) {
                if (this.data[tokenTypeKeyMap[requires[i][j]]]) {
                    if (flag) {
                        return false;
                    }
                    flag = true;
                }
            }
            if (!flag) {
                return false;
            }
        } else if (!(this.data[tokenTypeKeyMap[requires[i]]])) {
            return false;
        }
    }
    // TODO: validate optional keys
    // wo jue ding qi liao le.

    return true;
};

BibDad.prototype.output = function() {
    switch (this.bibtype) {
        //case TokenType.CONFERENCE:
        case TokenType.INPROCEEDINGS:
            return getInproceedingsStr(this.data);

        case TokenType.PROCEEDINGS:
            return getProceedingsStr(this.data);
    }
    return '';
};

function wrapData(kvalue, isLast) {
    if (kvalue instanceof Array) {
        var rtn = '';
        for (var i = 0, len = kvalue.length; i < len - 1; ++i) {
            rtn += (kvalue[i].toString() + ', ');
        }
        rtn += (kvalue[kvalue.length - 1] + (isLast ? '.' : '. '));
        return rtn;
    } else {
        return kvalue.toString() + (isLast ? '.' : '. ');
    }
}

function optionalStr(str) {
    return str ? (str + '. ') : '';
}

function getInproceedingsStr(data) {
    return wrapData(data[tokenTypeKeyMap[TokenType.AUTHOR]]) +
        wrapData(data[tokenTypeKeyMap[TokenType.TITLE]]) +
        wrapData(data[tokenTypeKeyMap[TokenType.BOOKTITLE]]) +
        optionalStr(data[tokenTypeKeyMap[TokenType.PAGES]]) +
        wrapData(data[tokenTypeKeyMap[TokenType.YEAR]], true);
}

function getProceedingsStr(data) {
    return optionalStr(data[tokenTypeKeyMap[TokenType.AUTHOR]]) +
        wrapData(data[tokenTypeKeyMap[TokenType.TITLE]]) +
        optionalStr(data[tokenTypeKeyMap[TokenType.BOOKTITLE]]) +
        optionalStr(data[tokenTypeKeyMap[TokenType.PAGES]]) +
        wrapData(data[tokenTypeKeyMap[TokenType.YEAR]], true);
}
