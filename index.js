'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PostgrestQuery = exports.PostgrestFetcher = undefined;

var _postgrestFetcher = require('./lib/PostgrestFetcher.js');

var _postgrestFetcher2 = _interopRequireDefault(_postgrestFetcher);

var _postgrestQuery = require('./lib/PostgrestQuery.js');

var _postgrestQuery2 = _interopRequireDefault(_postgrestQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.PostgrestFetcher = _postgrestFetcher2.default;
exports.PostgrestQuery = _postgrestQuery2.default;

