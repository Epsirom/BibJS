/**
 * Created by Epsirom on 14-5-6.
 */


var BibDad = require('../lib/bibdad');

var fs = require('fs');

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
            fs.appendFileSync(outputFileName, output + '\n');
        } else {
            console.log(counter + ': UNSUPPORTED OR ERROR OCCURRED!');
        }
        bib.reset();
    }
    console.log('Success! All output go to ' + outputFileName);
} catch (err) {
    console.log('Failed: ' + err.toString());
}
