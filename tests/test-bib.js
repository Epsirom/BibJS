/**
 * Created by Epsirom on 14-5-6.
 */

var str = '@INPROCEEDINGS         {       audio2tag:icme11               ,       \n' +
    '    AUTHOR              = "Karydis Loannis and Nanopoulos Alexandros",\n' +
    '    TITLE = "Audio-to-tag mapping: a novel approach for music similarity computation"     ,     \n' +
    '    BOOKTITLE = "IEEE International Conference on Multimedia and Expo",\n' +
    '    PAGES = {1-6}     ,\n' +
    '    YEAR = {2011}	}';

var Scanner = require('../lib/scanner/scanner');

var scanner = Scanner(str);

do {

    scanner.scan();

    console.log(scanner.token.unitName);
    console.log(scanner.token.innerProp);

    console.log('');
} while (scanner.token.unitName >= 0);
