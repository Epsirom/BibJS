/**
 * Created by Epsirom on 14-5-6.
 */

module.exports = AutomataData;

/*
 * Nodes in the automata:
 * node1: {
 *  next: {
 *      TokenType.TYPE1: node2,
 *      TokenType.TYPE2: node4,
 *      ...
 *  },
 *  accept: true/false,
 *  back: 1/0
 * }
 */

function AutomataData() {
    if (!(this instanceof AutomataData)) {
        return new AutomataData();
    } else {
        this.nodes = {};
        this.start = null;
        this.status = null;
    }
}

AutomataData.prototype.addNode = function(name, next, accept, back) {
    if (typeof next != 'object') {
        return;
    }
    if (this.nodes[name]) {
        delete this.nodes[name];
    }
    var bk = parseInt(back);
    if (isNaN(bk)) {
        bk = 0;
    }
    this.nodes[name] = {
        next: next,
        accept: !!accept,
        back: bk
    };
};

AutomataData.prototype.genNext = function() {
    var rtn = {};
    for (var i = 0, len = arguments.length; i < len; i += 2) {
        rtn[arguments[i]] = arguments[i + 1];
    }
    return rtn;
};

AutomataData.prototype.setNodeNext = function(name, input, next) {
    if (this.nodes[name]) {
        if (next === undefined) {
            delete this.nodes[name].next[input];
        } else {
            this.nodes[name].next[input] = next;
        }
    }
};

AutomataData.prototype.setStart = function(name) {
    if (this.nodes[name]) {
        this.start = name;
        this.status = name;
        return true;
    }
    return false;
};

AutomataData.prototype.isAccept = function() {
    return this.nodes[this.status].accept;
};

AutomataData.prototype.getBack = function() {
    return this.nodes[this.status].back;
};

AutomataData.prototype.getNode = function(name) {
    return this.nodes[name];
};

AutomataData.prototype.getCurrentNode = function() {
    return this.nodes[this.status];
};
