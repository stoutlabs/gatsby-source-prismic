"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _crypto = require("crypto");

var _fp = require("lodash/fp");

var _pIsPromise = require("p-is-promise");

var _pIsPromise2 = _interopRequireDefault(_pIsPromise);

var _jsonStringifySafe = require("json-stringify-safe");

var _jsonStringifySafe2 = _interopRequireDefault(_jsonStringifySafe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Default parent ID for all nodes.
var DEFAULT_PARENT_ID = "__SOURCE__";

// Node fields used internally by Gatsby.
var RESTRICTED_NODE_FIELDS = ["id", "children", "parent", "fields", "internal"];

// Generates an MD5 hash from a string.
var digest = function digest(str) {
  return (0, _crypto.createHash)("md5").update(str).digest("hex");
};

// Generates an MD5 hash of an object and assign it to the internal.contentDigest key.
var withDigest = function withDigest(obj) {
  return (0, _fp.assoc)(["internal", "contentDigest"], digest((0, _jsonStringifySafe2.default)(obj)), obj);
};

// Returns node helpers for creating new nodes.
var createNodeHelpers = function createNodeHelpers() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!(0, _fp.isPlainObject)(options)) throw new Error("Options must be an object. An argument of type " + (typeof options === "undefined" ? "undefined" : (0, _typeof3.default)(options)) + " was provided.");

  if (typeof options.sourceId !== "undefined" && typeof options.sourceId !== "string") throw new Error("options.sourceId must be a string. A value of type " + (0, _typeof3.default)(options.sourceId) + " was provided.");

  if (typeof options.typePrefix !== "string") throw new Error("options.typePrefix must be a string. A value of type " + (0, _typeof3.default)(options.typePrefix) + " was provided.");

  if (typeof options.conflictFieldPrefix !== "undefined" && typeof options.conflictFieldPrefix !== "string") throw new Error("options.conflictFieldPrefix must be a string. A value of type " + (0, _typeof3.default)(options.conflictFieldPrefix) + " was provided.");

  var _options$sourceId = options.sourceId,
      sourceId = _options$sourceId === undefined ? DEFAULT_PARENT_ID : _options$sourceId,
      typePrefix = options.typePrefix,
      _options$conflictFiel = options.conflictFieldPrefix,
      conflictFieldPrefix = _options$conflictFiel === undefined ? (0, _fp.lowerFirst)(typePrefix) : _options$conflictFiel;

  // Generates a node ID from a given type and node ID.

  var generateNodeId = function generateNodeId(type, id) {
    return typePrefix + "__" + (0, _fp.upperFirst)((0, _fp.camelCase)(type)) + "__" + id;
  };

  // Generates a node type name from a given type.
  var generateTypeName = function generateTypeName(type) {
    return (0, _fp.upperFirst)((0, _fp.camelCase)(typePrefix + " " + type));
  };

  // Prefixes conflicting node fields.
  var prefixConflictingKeys = function prefixConflictingKeys(obj) {
    (0, _keys2.default)(obj).forEach(function (key) {
      if (RESTRICTED_NODE_FIELDS.includes(key)) {
        obj[conflictFieldPrefix + (0, _fp.upperFirst)(key)] = obj[key];
        delete obj[key];
      }
    });

    return obj;
  };

  // Creates a node factory with a given type and middleware processor.
  var createNodeFactory = function createNodeFactory(type) {
    var middleware = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _fp.identity;
    return function (obj) {
      var overrides = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      // if (!isPlainObject(obj))
      //   throw new Error(
      //     `The source object must be a plain object. An argument of type "${typeof obj}" was provided.`,
      //   )

      // if (!isPlainObject(overrides))
      //   throw new Error(
      //     `Node overrides must be a plain object. An argument of type "${typeof overrides}" was provided.`,
      //   )

      var clonedObj = (0, _fp.cloneDeep)(obj);
      var safeObj = prefixConflictingKeys(clonedObj);

      var node = (0, _extends3.default)({}, safeObj, {
        id: generateNodeId(type, obj.id),
        parent: sourceId,
        children: [],
        internal: {
          type: generateTypeName(type)
        }
      });

      node = middleware(node);

      if ((0, _pIsPromise2.default)(node)) return node.then(function (resolvedNode) {
        return withDigest((0, _extends3.default)({}, resolvedNode, overrides));
      });

      return withDigest((0, _extends3.default)({}, node, overrides));
    };
  };

  return {
    createNodeFactory: createNodeFactory,
    generateNodeId: generateNodeId,
    generateTypeName: generateTypeName
  };
};

exports.default = createNodeHelpers;