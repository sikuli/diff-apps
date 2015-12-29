'use strict';
const chai = require('chai'),
    should = chai.should(),
    path = require('path'),
    fs = require('fs'),
    suffixExtractor = require('../lib/index/suffix-extractor');

describe('test UI hierarchical index h1 extractor', function () {
    this.timeout(5000);

    it('should extract parent-child tags', function (done) {
        var file = [path.resolve(__dirname, '../fixtures/examples/index/me.pou.app-188.xml')];
        var expected = fs.readFileSync(__dirname + '/../fixtures/examples/index/me.pou.app-188-ui-suffix.txt', 'utf8');
        var target = path.resolve(__dirname , '../indexes/ui/suffix/');
        suffixExtractor(file, target).then(() => {
            var targetFile = path.resolve(__dirname, '../indexes/ui/suffix/me.pou.app-188-ui-suffix.txt');
            var exists = fs.existsSync(targetFile);
            exists.should.equal(true);
            var result = fs.readFileSync(targetFile, 'utf8');
            result.should.equal(expected);
            done();
        }).catch((e) => {
            should.not.exist(e);
            done(e);
        });
    })
});
