/**
 * Created by Epsirom on 14-5-6.
 */

module.exports = {
    // FOR CHAR-TOKEN
    CharToken:{
        TYPE_START: 0,
        EMPTY_CHAR: 1,
        EQUAL: 2,
        COMMA: 3,
        QUOTE: 4,
        DOUBLE_QUOTE: 5,
        LEFT_BRACE: 6,
        RIGHT_BRACE: 7,
        COMMON_CHAR: 8,
        TOO_LONG: -2,
        TOO_SHORT: -3,
        ERROR: -1
    },
    // FOR TOKEN
    Token: {
        CONFERENCE: 0,      // same as INPROCEEDING
        PROCEEDINGS: 1,
        INPROCEEDINGS: 0,
        LEFT_BRACE: 6,
        CITE_NAME: 2,
        AUTHOR: 3,
        TITLE: 4,
        BOOKTITLE: 5,
        YEAR: 8,
        EDITOR: 9,
        VOLUME: 10,
        NUMBER: 11,
        SERIES: 12,
        PAGES: 13,
        ADDRESS: 14,
        MONTH: 15,
        ORGANIZATION: 16,
        PUBLISHER: 17,
        NOTE: 18,
        KEY: 19,
        RIGHT_BRACE: 7,
        OTHER: 999,
        NO_MORE: -2,
        UNSUPPORT_LABEL: -3,
        ERROR: -1
    }
};
