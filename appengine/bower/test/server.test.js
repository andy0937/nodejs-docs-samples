// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var express = require('express');
var path = require('path');
var proxyquire = require('proxyquire').noPreserveCache();
var request = require('supertest');

var SAMPLE_PATH = path.join(__dirname, '../server.js');

function getSample () {
  var testApp = express();
  sinon.stub(testApp, 'listen').callsArg(1);
  var expressMock = sinon.stub().returns(testApp);

  var app = proxyquire(SAMPLE_PATH, {
    express: expressMock
  });
  return {
    app: app,
    mocks: {
      express: expressMock
    }
  };
}

describe('appengine/bower/server.js', function () {
  var sample;

  beforeEach(function () {
    sample = getSample();

    assert(sample.mocks.express.calledOnce);
    assert(sample.app.listen.calledOnce);
    assert.equal(sample.app.listen.firstCall.args[0], process.env.PORT || 8080);
  });

  it('should render a page', function (done) {
    var expectedResult = '<h1>Hello World!</h1><p>Express.js + Bower on Google App Engine.</p>';

    request(sample.app)
      .get('/')
      .expect(200)
      .expect(function (response) {
        assert.notEqual(response.text.indexOf(expectedResult), -1);
      })
      .end(done);
  });
});