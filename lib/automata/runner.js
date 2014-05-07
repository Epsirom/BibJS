/**
 * Created by Epsirom on 14-5-6.
 */

module.exports = AutomataRunner;

var AutomataData = require('./inner-data');

function AutomataRunner() {
    if (!(this instanceof AutomataRunner)) {
        return new AutomataRunner();
    } else {
        this.data = AutomataData();
    }
}

AutomataRunner.prototype.isAccept = function() {
    return this.data.isAccept();
};

AutomataRunner.prototype.getBack = function() {
    return this.data.getBack();
};

AutomataRunner.prototype.current = function() {
    return this.data.status;
};

AutomataRunner.prototype.restart = function() {
    this.data.status = this.data.start;
};

AutomataRunner.prototype.getData = function() {
    return this.data;
};

AutomataRunner.prototype.setData = function(data) {
    if (data instanceof AutomataData) {
        this.data = data;
    }
};

AutomataRunner.prototype.executeOnce = function(input) {
    var currentNode = this.data.getCurrentNode();
    var next = currentNode.next[input];
    if (next !== undefined && typeof this.data.nodes[next] == 'object') {
        this.data.status = next;
        return true;
    } else {
        return false;
    }
};

// queue: input sequence
AutomataRunner.prototype.validateQueue = function(queue) {
    if (!queue instanceof Array) {
        return undefined;
    }
    this.restart();
    for (var i = 0, len = queue.length; i < len; ++i) {
        this.executeOnce(queue[i]);
    }
    return this.isAccept();
};
