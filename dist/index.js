"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

String.prototype.remove = function (toRemove) {
  if (Array.isArray(toRemove)) {
    return toRemove.reduce(function (acc, value) {
      return acc.replace(value, '');
    }, this);
  }

  if (typeof toRemove === 'string') {
    return this.replace(toRemove, '');
  }

  return this;
};

var cleanupObject = function cleanupObject(obj) {
  Object.keys(obj).forEach(function (key) {
    return obj[key] === undefined ? delete obj[key] : {};
  });
  return obj;
};

var isFolder = function isFolder(item) {
  return !!item.match(/<H3.*>.*<\/H3>/);
};

var isLink = function isLink(item) {
  return !!item.match(/<A.*>.*<\/A>/);
};

var getTitle = function getTitle(item) {
  var _item$match;

  return (_item$match = item.match(/<(H3|A).*>(.*)<\/(H3|A)>/)) === null || _item$match === void 0 ? void 0 : _item$match[2];
};

var getIcon = function getIcon(item) {
  var _item$match2;

  return (_item$match2 = item.match(/ICON="(.+)"/)) === null || _item$match2 === void 0 ? void 0 : _item$match2[1];
};

var getUrl = function getUrl(item) {
  var _item$match3;

  return (_item$match3 = item.match(/HREF="([^"]*)"/)) === null || _item$match3 === void 0 ? void 0 : _item$match3[1];
};

var getNumericProperty = function getNumericProperty(item, property) {
  var match = item.match(new RegExp("".concat(property, "=\"([\\d]+)\"")));
  return match ? parseInt(match[1]) : undefined;
};

var transformLink = function transformLink(markup) {
  return cleanupObject({
    type: 'link',
    addDate: getNumericProperty(markup, 'ADD_DATE'),
    title: getTitle(markup),
    icon: getIcon(markup),
    url: getUrl(markup)
  });
};

var transformFolder = function transformFolder(markup) {
  return cleanupObject({
    type: 'folder',
    addDate: getNumericProperty(markup, 'ADD_DATE'),
    lastModified: getNumericProperty(markup, 'LAST_MODIFIED'),
    title: getTitle(markup)
  });
};

var findItemsAtIndentLevel = function findItemsAtIndentLevel(markup, level) {
  return markup.match(new RegExp("^\\s{".concat(level * 4, "}<DT>(.*)[\r\n]"), 'gm'));
};

var findLinks = function findLinks(markup, level) {
  return findItemsAtIndentLevel(markup, level).filter(isLink);
};

var findFolders = function findFolders(markup, level) {
  var folders = findItemsAtIndentLevel(markup, level);
  return folders === null || folders === void 0 ? void 0 : folders.map(function (folder, index) {
    var isLastOne = index === folders.length - 1;
    return markup.substring(markup.indexOf(folder), isLastOne ? undefined : markup.indexOf(folders[index + 1]));
  });
};

var findChildren = function findChildren(markup) {
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  if (findItemsAtIndentLevel(markup, level)) {
    var links = findLinks(markup, level);
    var folders = findFolders(markup.remove(links), level);
    return [].concat(_toConsumableArray(links || []), _toConsumableArray(folders || []));
  }
};

var processChild = function processChild(child) {
  var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  if (isFolder(child)) return processFolder(child, level);
  if (isLink(child)) return transformLink(child);
};

var processFolder = function processFolder(folder, level) {
  var _children$map;

  var children = findChildren(folder, level + 1);
  return cleanupObject(_objectSpread(_objectSpread({}, transformFolder(folder)), {}, {
    children: children === null || children === void 0 ? void 0 : (_children$map = children.map(function (child) {
      return processChild(child, level + 1);
    })) === null || _children$map === void 0 ? void 0 : _children$map.filter(Boolean)
  }));
};
/**
 * Convert NETSCAPE-Bookmark-file to JSON format
 * @param {string} markup - The content of the bookmarks file
 * @param {object} options - { stringify, formatJSON, spaces }
 * @returns The bookmarks in JSON format
 */


var bookmarksToJSON = function bookmarksToJSON(markup) {
  var _findChildren;

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$stringify = _ref.stringify,
      stringify = _ref$stringify === void 0 ? true : _ref$stringify,
      _ref$formatJSON = _ref.formatJSON,
      formatJSON = _ref$formatJSON === void 0 ? false : _ref$formatJSON,
      _ref$spaces = _ref.spaces,
      spaces = _ref$spaces === void 0 ? 2 : _ref$spaces;

  var obj = (_findChildren = findChildren(markup)) === null || _findChildren === void 0 ? void 0 : _findChildren.map(processChild);
  if (!stringify) return obj;
  return JSON.stringify.apply(JSON, [obj].concat(_toConsumableArray(formatJSON ? [null, spaces] : [])));
};

var _default = bookmarksToJSON;
exports["default"] = _default;
module.exports = exports.default;