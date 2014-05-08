/**
 * Created by Epsirom on 14-5-6.
 */

module.exports = BibScanner;

var Token = require('./token');
var Automata = require('../automata/runner');
var AutomataData = require('../automata/inner-data');
var CharToken = require('./char-token');
var TokenTypes = require('./token-types');
var TokenType = TokenTypes.Token;
var CharTokenType = TokenTypes.CharToken;

function BibScanner(str) {
    if (!(this instanceof BibScanner)) {
        return new BibScanner(str);
    } else {
        this.token = Token();
        if (str === undefined || str === null) {
            str = '';
        }
        this.str = str.toString();
        this.pointer = 0;
        this.automata = Automata();
        var dt = AutomataData();
        dt.addNode('init', dt.genNext(
            CharTokenType.EMPTY_CHAR, 'init',
            CharTokenType.TYPE_START, 'type_start',
            CharTokenType.LEFT_BRACE, 'left_brace',
            CharTokenType.RIGHT_BRACE, 'right_brace',
            CharTokenType.COMMON_CHAR, 'label_start'
        ), false, 0);
        dt.addNode('type_start', dt.genNext(
            CharTokenType.COMMON_CHAR, 'type_start',
            CharTokenType.EMPTY_CHAR, 'type_end',
            CharTokenType.LEFT_BRACE, 'type_end'
        ), false, 0);
        dt.addNode('type_end', {}, true, 1);
        dt.addNode('left_brace', {}, true, 0);
        dt.addNode('right_brace', {}, true, 0);
        dt.addNode('label_start', dt.genNext(
            CharTokenType.EMPTY_CHAR, 'label_ready',
            CharTokenType.COMMON_CHAR, 'label_start',
            CharTokenType.EQUAL, 'label_value_ready',
            CharTokenType.RIGHT_BRACE, 'label_end',
            CharTokenType.COMMA, 'label_end_no_back'
        ), false, 0);
        dt.addNode('label_ready', dt.genNext(
            CharTokenType.EMPTY_CHAR, 'label_ready',
            CharTokenType.EQUAL, 'label_value_ready',
            CharTokenType.RIGHT_BRACE, 'label_end',
            CharTokenType.COMMA, 'label_end_no_back'
        ), false, 0);
        dt.addNode('label_value_ready', dt.genNext(
            CharTokenType.EMPTY_CHAR, 'label_value_ready',
            CharTokenType.DOUBLE_QUOTE, 'dq_value',
            CharTokenType.LEFT_BRACE, 'brace_value'
        ), false, 0);
        dt.addNode('dq_value', dt.genNext(
            CharTokenType.TYPE_START, 'dq_value',
            CharTokenType.EMPTY_CHAR, 'dq_value',
            CharTokenType.EQUAL, 'dq_value',
            CharTokenType.COMMA, 'dq_value',
            CharTokenType.QUOTE, 'dq_value',
            CharTokenType.LEFT_BRACE, 'dq_value',
            CharTokenType.RIGHT_BRACE, 'dq_value',
            CharTokenType.COMMON_CHAR, 'dq_value',
            CharTokenType.DOUBLE_QUOTE, 'label_good'
        ), false, 0);
        dt.addNode('brace_value', dt.genNext(
            CharTokenType.TYPE_START, 'brace_value',
            CharTokenType.EMPTY_CHAR, 'brace_value',
            CharTokenType.EQUAL, 'brace_value',
            CharTokenType.COMMA, 'brace_value',
            CharTokenType.QUOTE, 'brace_value',
            CharTokenType.DOUBLE_QUOTE, 'brace_value',
            CharTokenType.LEFT_BRACE, 'brace_value',
            CharTokenType.COMMON_CHAR, 'brace_value',
            CharTokenType.RIGHT_BRACE, 'label_good'
        ), false, 0);
        dt.addNode('label_good', dt.genNext(
            CharTokenType.EMPTY_CHAR, 'label_good',
            CharTokenType.COMMA, 'label_end_no_back',
            CharTokenType.RIGHT_BRACE, 'label_end'
        ), false, 0);
        dt.addNode('label_end', {}, true, 1);
        dt.addNode('label_end_no_back', {}, true, 0);
        dt.setStart('init');
        this.automata.setData(dt);
    }
}

BibScanner.prototype.scan = function() {
    if (this.pointer >= this.str.length) {
        this.token.setToken(TokenType.NO_MORE, null);
    } else {
        this.automata.restart();
        var ctoken = CharToken();
        var prop = '';
        while (!this.automata.isAccept()) {
            if (this.pointer >= this.str.length) {
                this.token.setToken(TokenType.ERROR, null);
                return;
            }
            ctoken.updateByChar(this.str[this.pointer]);
            if (!this.automata.executeOnce(ctoken.unitName)) {
                this.token.setToken(TokenType.ERROR, null);
                return;
            }
            var cur = this.automata.current();
            if (cur == 'type_start' || cur == 'label_start' || cur == 'dq_value' || cur == 'brace_value') {
                prop += ctoken.innerProp;
            }
            switch (cur) {
                case 'type_end':
                    switch (prop.toUpperCase()) {
                        case '@INPROCEEDINGS':
                            this.token.setToken(TokenType.INPROCEEDINGS, null);
                            break;

                        case '@PROCEEDINGS':
                            this.token.setToken(TokenType.PROCEEDINGS, null);
                            break;

                        case '@CONFERENCE':
                            this.token.setToken(TokenType.CONFERENCE, null);
                            break;

                        default :
                            this.token.setToken(TokenType.UNSUPPORT_TYPE, null);
                    }
                    break;

                case 'left_brace':
                    this.token.setToken(TokenType.LEFT_BRACE, null);
                    break;

                case 'right_brace':
                    this.token.setToken(TokenType.RIGHT_BRACE, null);
                    break;

                case 'label_start':
                    this.token.setToken(TokenType.CITE_NAME, null);
                    break;

                case 'label_value_ready':
                    if (this.token.unitName == TokenType.CITE_NAME) {
                        switch (prop.toUpperCase()) {
                            case 'AUTHOR':
                                this.token.setToken(TokenType.AUTHOR, null);
                                break;

                            case 'TITLE':
                                this.token.setToken(TokenType.TITLE, null);
                                break;

                            case 'BOOKTITLE':
                                this.token.setToken(TokenType.BOOKTITLE, null);
                                break;

                            case 'YEAR':
                                this.token.setToken(TokenType.YEAR, null);
                                break;

                            case 'EDITOR':
                                this.token.setToken(TokenType.EDITOR, null);
                                break;

                            case 'VOLUME':
                                this.token.setToken(TokenType.VOLUME, null);
                                break;

                            case 'NUMBER':
                                this.token.setToken(TokenType.NUMBER, null);
                                break;

                            case 'SERIES':
                                this.token.setToken(TokenType.SERIES, null);
                                break;

                            case 'PAGES':
                                this.token.setToken(TokenType.PAGES, null);
                                break;

                            case 'ADDRESS':
                                this.token.setToken(TokenType.ADDRESS, null);
                                break;

                            case 'MONTH':
                                this.token.setToken(TokenType.MONTH, null);
                                break;

                            case 'ORGANIZATION':
                                this.token.setToken(TokenType.ORGANIZATION, null);
                                break;

                            case 'PUBLISHER':
                                this.token.setToken(TokenType.PUBLISHER, null);
                                break;

                            case 'NOTE':
                                this.token.setToken(TokenType.NOTE, null);
                                break;

                            case 'KEY':
                                this.token.setToken(TokenType.KEY, null);
                                break;

                            default :
                                this.token.setToken(TokenType.UNSUPPORT_LABEL, null);
                        }
                        prop = '';
                    }
                    break;

                case 'label_good':
                    break;

                case 'label_end_no_back':
                case 'label_end':
                    if (this.token.unitName == TokenType.CITE_NAME) {
                        this.token.setProp(prop);
                    } else {
                        this.token.setProp(prop.substr(1));
                    }
                    break;
            }
            ++this.pointer;
            this.pointer -= this.automata.getBack();
        }
    }
};

BibScanner.prototype.getToken = function() {
    return this.token;
};

