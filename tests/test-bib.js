/**
 * Created by Epsirom on 14-5-6.
 */


var BibDad = require('../lib/bibdad');

var fs = require('fs');
var TokenTypes = require('../lib/scanner/token-types');
var TokenType = TokenTypes.Token;

var inputFileName = './tests/data/example.bib';
var outputFileName = './tests/data/result.txt';

var bib = BibDad();

try {
    fs.truncateSync(outputFileName, 0);
} catch (err) {
    console.log('Prepare output file failed: ' + err.toString());
}

try {
    var counter = 0;
    bib.loadStr(fs.readFileSync(inputFileName));
    console.log('Input is ready!');
    while (bib.analyze()) {
        ++counter;
        if (bib.validate()) {
            var output = bib.output();
            console.log(counter + ': ' + output);
            fs.appendFileSync(outputFileName, output + '\r\n');
        } else {
            console.log(counter + ': UNSUPPORTED');
        }
        bib.reset();
    }
    if (!(bib.automata.isAccept()) && bib.scanner.token.unitName != TokenType.NO_MORE) {
        console.log('Error occurred at byte ' + bib.scanner.pointer);
        console.log('   ...' +
            (function(str) {
                var rtn = '';
                for (var i = 0, len = str.length; i < len; ++i) {
                    if (str[i] == '\n' || str[i] == '\r' || str[i] == '\t') {
                        rtn += ' ';
                    } else {
                        rtn += str[i];
                    }
                }
                return rtn;
            })(bib.scanner.str.substr(bib.scanner.pointer - 15, 31)) + '...'
        );
        console.log('   ...               ^               ...');
    } else {
        console.log('Success! All output go to ' + outputFileName);
    }
} catch (err) {
    console.log('Failed: ' + err.toString());
}
