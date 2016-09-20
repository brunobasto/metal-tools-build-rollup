'use strict';

var assert = require('assert');
var del = require('del');
var fs = require('fs');
var metalToolsBuildRollup = require('../index');
var sinon = require('sinon');
var vfs = require('vinyl-fs');

describe('Metal Tools - Rollup Build', function() {
  beforeEach(function() {
    var stream = {
      pipe: function() {
        return stream;
      },
      readable: true,
      resume: sinon.stub()
    };
    sinon.stub(vfs, 'src').returns(stream);
    sinon.stub(vfs, 'dest');
  });

  afterEach(function() {
    restoreStream();
  });

  it('should build files from "src/SpecifyEntryFileName.js" and to to "build/rollup" by default', function() {
    metalToolsBuildRollup();
    assert.strictEqual('src/SpecifyEntryFileName.js', vfs.src.args[0][0]);
    assert.strictEqual('build/rollup', vfs.dest.args[0][0]);
	});

  it('should consume stream by default', function() {
    var stream = metalToolsBuildRollup();
    assert.strictEqual(1, stream.resume.callCount);
  });

  it('should not consume stream if skipConsume is set to true', function() {
    var stream = metalToolsBuildRollup({
      skipConsume: true
    });
    assert.strictEqual(0, stream.resume.callCount);
  });

  describe('Integration', function() {
    beforeEach(function(done) {
      deleteBuiltFiles(done);
      restoreStream();
    });

  	after(function(done) {
      deleteBuiltFiles(done);
  	});

  	it('should build specified js files into a single bundle', function(done) {
      var stream = metalToolsBuildRollup({
        src: 'test/fixtures/js/foo.js',
        dest: 'test/fixtures/build'
      });
      stream.on('end', function() {
        assert.ok(fs.existsSync('test/fixtures/build/metal.js'));
    		done();
      });
  	});
  });
});

function deleteBuiltFiles(done) {
  del('test/fixtures/build').then(function() {
    done();
  });
}

function restoreStream() {
  if (vfs.src.restore) {
    vfs.src.restore();
  }
  if (vfs.dest.restore) {
    vfs.dest.restore();
  }
}
