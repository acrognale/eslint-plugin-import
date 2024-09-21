'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _contextCompat = require('eslint-module-utils/contextCompat');
var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _semver = require('semver');var _semver2 = _interopRequireDefault(_semver);
var _arrayPrototype = require('array.prototype.flatmap');var _arrayPrototype2 = _interopRequireDefault(_arrayPrototype);

var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _toArray(arr) {return Array.isArray(arr) ? arr : Array.from(arr);}

var typescriptPkg = void 0;
try {
  typescriptPkg = require('typescript/package.json'); // eslint-disable-line import/no-extraneous-dependencies
} catch (e) {/**/}

function isPunctuator(node, value) {
  return node.type === 'Punctuator' && node.value === value;
}

// Get the name of the default import of `node`, if any.
function getDefaultImportName(node) {
  var defaultSpecifier = node.specifiers.
  find(function (specifier) {return specifier.type === 'ImportDefaultSpecifier';});
  return defaultSpecifier != null ? defaultSpecifier.local.name : undefined;
}

// Checks whether `node` has a namespace import.
function hasNamespace(node) {
  var specifiers = node.specifiers.
  filter(function (specifier) {return specifier.type === 'ImportNamespaceSpecifier';});
  return specifiers.length > 0;
}

// Checks whether `node` has any non-default specifiers.
function hasSpecifiers(node) {
  var specifiers = node.specifiers.
  filter(function (specifier) {return specifier.type === 'ImportSpecifier';});
  return specifiers.length > 0;
}

// Checks whether `node` has a comment (that ends) on the previous line or on
// the same line as `node` (starts).
function hasCommentBefore(node, sourceCode) {
  return sourceCode.getCommentsBefore(node).
  some(function (comment) {return comment.loc.end.line >= node.loc.start.line - 1;});
}

// Checks whether `node` has a comment (that starts) on the same line as `node`
// (ends).
function hasCommentAfter(node, sourceCode) {
  return sourceCode.getCommentsAfter(node).
  some(function (comment) {return comment.loc.start.line === node.loc.end.line;});
}

// Checks whether `node` has any comments _inside,_ except inside the `{...}`
// part (if any).
function hasCommentInsideNonSpecifiers(node, sourceCode) {
  var tokens = sourceCode.getTokens(node);
  var openBraceIndex = tokens.findIndex(function (token) {return isPunctuator(token, '{');});
  var closeBraceIndex = tokens.findIndex(function (token) {return isPunctuator(token, '}');});
  // Slice away the first token, since we're no looking for comments _before_
  // `node` (only inside). If there's a `{...}` part, look for comments before
  // the `{`, but not before the `}` (hence the `+1`s).
  var someTokens = openBraceIndex >= 0 && closeBraceIndex >= 0 ?
  tokens.slice(1, openBraceIndex + 1).concat(tokens.slice(closeBraceIndex + 1)) :
  tokens.slice(1);
  return someTokens.some(function (token) {return sourceCode.getCommentsBefore(token).length > 0;});
}

// It's not obvious what the user wants to do with comments associated with
// duplicate imports, so skip imports with comments when autofixing.
function hasProblematicComments(node, sourceCode) {
  return (
    hasCommentBefore(node, sourceCode) ||
    hasCommentAfter(node, sourceCode) ||
    hasCommentInsideNonSpecifiers(node, sourceCode));

}

function getFix(first, rest, sourceCode, context) {
  // Sorry ESLint <= 3 users, no autofix for you. Autofixing duplicate imports
  // requires multiple `fixer.whatever()` calls in the `fix`: We both need to
  // update the first one, and remove the rest. Support for multiple
  // `fixer.whatever()` in a single `fix` was added in ESLint 4.1.
  // `sourceCode.getCommentsBefore` was added in 4.0, so that's an easy thing to
  // check for.
  if (typeof sourceCode.getCommentsBefore !== 'function') {
    return undefined;
  }

  // Adjusting the first import might make it multiline, which could break
  // `eslint-disable-next-line` comments and similar, so bail if the first
  // import has comments. Also, if the first import is `import * as ns from
  // './foo'` there's nothing we can do.
  if (hasProblematicComments(first, sourceCode) || hasNamespace(first)) {
    return undefined;
  }

  var defaultImportNames = new Set(
  (0, _arrayPrototype2['default'])([].concat(first, rest || []), function (x) {return getDefaultImportName(x) || [];}));


  // Bail if there are multiple different default import names – it's up to the
  // user to choose which one to keep.
  if (defaultImportNames.size > 1) {
    return undefined;
  }

  // Leave it to the user to handle comments. Also skip `import * as ns from
  // './foo'` imports, since they cannot be merged into another import.
  var restWithoutComments = rest.filter(function (node) {return !hasProblematicComments(node, sourceCode) && !hasNamespace(node);});

  var specifiers = restWithoutComments.
  map(function (node) {
    var tokens = sourceCode.getTokens(node);
    var openBrace = tokens.find(function (token) {return isPunctuator(token, '{');});
    var closeBrace = tokens.find(function (token) {return isPunctuator(token, '}');});

    if (openBrace == null || closeBrace == null) {
      return undefined;
    }

    return {
      importNode: node,
      identifiers: sourceCode.text.slice(openBrace.range[1], closeBrace.range[0]).split(','), // Split the text into separate identifiers (retaining any whitespace before or after)
      isEmpty: !hasSpecifiers(node) };

  }).
  filter(Boolean);

  var unnecessaryImports = restWithoutComments.filter(function (node) {return !hasSpecifiers(node) &&
    !hasNamespace(node) &&
    !specifiers.some(function (specifier) {return specifier.importNode === node;});});


  var shouldAddDefault = getDefaultImportName(first) == null && defaultImportNames.size === 1;
  var shouldAddSpecifiers = specifiers.length > 0;
  var shouldRemoveUnnecessary = unnecessaryImports.length > 0;
  var preferInline = context.options[0] && context.options[0]['prefer-inline'];

  if (!(shouldAddDefault || shouldAddSpecifiers || shouldRemoveUnnecessary)) {
    return undefined;
  }

  return function (fixer) {
    var tokens = sourceCode.getTokens(first);
    var openBrace = tokens.find(function (token) {return isPunctuator(token, '{');});
    var closeBrace = tokens.find(function (token) {return isPunctuator(token, '}');});
    var firstToken = sourceCode.getFirstToken(first);var _defaultImportNames = _slicedToArray(
    defaultImportNames, 1),defaultImportName = _defaultImportNames[0];

    var firstHasTrailingComma = closeBrace != null && isPunctuator(sourceCode.getTokenBefore(closeBrace), ',');
    var firstIsEmpty = !hasSpecifiers(first);
    var firstExistingIdentifiers = firstIsEmpty ?
    new Set() :
    new Set(sourceCode.text.slice(openBrace.range[1], closeBrace.range[0]).
    split(',').
    map(function (x) {return x.trim();}));var _specifiers$reduce =


    specifiers.reduce(
    function (_ref, specifier) {var _ref2 = _slicedToArray(_ref, 3),result = _ref2[0],needsComma = _ref2[1],existingIdentifiers = _ref2[2];
      var isTypeSpecifier = specifier.importNode.importKind === 'type';

      // a user might set prefer-inline but not have a supporting TypeScript version. Flow does not support inline types so this should fail in that case as well.
      if (preferInline && (!typescriptPkg || !_semver2['default'].satisfies(typescriptPkg.version, '>= 4.5'))) {
        throw new Error('Your version of TypeScript does not support inline type imports.');
      }

      // Add *only* the new identifiers that don't already exist, and track any new identifiers so we don't add them again in the next loop
      var _specifier$identifier = specifier.identifiers.reduce(function (_ref3, cur) {var _ref4 = _slicedToArray(_ref3, 2),text = _ref4[0],set = _ref4[1];
        var trimmed = cur.trim(); // Trim whitespace before/after to compare to our set of existing identifiers
        var curWithType = trimmed.length > 0 && preferInline && isTypeSpecifier ? 'type ' + String(cur) : cur;
        if (existingIdentifiers.has(trimmed)) {
          return [text, set];
        }
        return [text.length > 0 ? String(text) + ',' + String(curWithType) : curWithType, set.add(trimmed)];
      }, ['', existingIdentifiers]),_specifier$identifier2 = _slicedToArray(_specifier$identifier, 2),specifierText = _specifier$identifier2[0],updatedExistingIdentifiers = _specifier$identifier2[1];

      return [
      needsComma && !specifier.isEmpty && specifierText.length > 0 ? String(
      result) + ',' + String(specifierText) : '' + String(
      result) + String(specifierText),
      specifier.isEmpty ? needsComma : true,
      updatedExistingIdentifiers];

    },
    ['', !firstHasTrailingComma && !firstIsEmpty, firstExistingIdentifiers]),_specifiers$reduce2 = _slicedToArray(_specifiers$reduce, 1),specifiersText = _specifiers$reduce2[0];


    var fixes = [];

    if (shouldAddSpecifiers && preferInline && first.importKind === 'type') {
      // `import type {a} from './foo'` → `import {type a} from './foo'`
      var typeIdentifierToken = tokens.find(function (token) {return token.type === 'Identifier' && token.value === 'type';});
      fixes.push(fixer.removeRange([typeIdentifierToken.range[0], typeIdentifierToken.range[1] + 1]));

      tokens.
      filter(function (token) {return firstExistingIdentifiers.has(token.value);}).
      forEach(function (identifier) {
        fixes.push(fixer.replaceTextRange([identifier.range[0], identifier.range[1]], 'type ' + String(identifier.value)));
      });
    }

    if (shouldAddDefault && openBrace == null && shouldAddSpecifiers) {
      // `import './foo'` → `import def, {...} from './foo'`
      fixes.push(
      fixer.insertTextAfter(firstToken, ' ' + String(defaultImportName) + ', {' + String(specifiersText) + '} from'));

    } else if (shouldAddDefault && openBrace == null && !shouldAddSpecifiers) {
      // `import './foo'` → `import def from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ' ' + String(defaultImportName) + ' from'));
    } else if (shouldAddDefault && openBrace != null && closeBrace != null) {
      // `import {...} from './foo'` → `import def, {...} from './foo'`
      fixes.push(fixer.insertTextAfter(firstToken, ' ' + String(defaultImportName) + ','));
      if (shouldAddSpecifiers) {
        // `import def, {...} from './foo'` → `import def, {..., ...} from './foo'`
        fixes.push(fixer.insertTextBefore(closeBrace, specifiersText));
      }
    } else if (!shouldAddDefault && openBrace == null && shouldAddSpecifiers) {
      if (first.specifiers.length === 0) {
        // `import './foo'` → `import {...} from './foo'`
        fixes.push(fixer.insertTextAfter(firstToken, ' {' + String(specifiersText) + '} from'));
      } else {
        // `import def from './foo'` → `import def, {...} from './foo'`
        fixes.push(fixer.insertTextAfter(first.specifiers[0], ', {' + String(specifiersText) + '}'));
      }
    } else if (!shouldAddDefault && openBrace != null && closeBrace != null) {
      // `import {...} './foo'` → `import {..., ...} from './foo'`
      fixes.push(fixer.insertTextBefore(closeBrace, specifiersText));
    }

    // Remove imports whose specifiers have been moved into the first import.
    var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {for (var _iterator = specifiers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var specifier = _step.value;
        var importNode = specifier.importNode;
        fixes.push(fixer.remove(importNode));

        var charAfterImportRange = [importNode.range[1], importNode.range[1] + 1];
        var charAfterImport = sourceCode.text.substring(charAfterImportRange[0], charAfterImportRange[1]);
        if (charAfterImport === '\n') {
          fixes.push(fixer.removeRange(charAfterImportRange));
        }
      }

      // Remove imports whose default import has been moved to the first import,
      // and side-effect-only imports that are unnecessary due to the first
      // import.
    } catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {for (var _iterator2 = unnecessaryImports[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var node = _step2.value;
        fixes.push(fixer.remove(node));

        var charAfterImportRange = [node.range[1], node.range[1] + 1];
        var charAfterImport = sourceCode.text.substring(charAfterImportRange[0], charAfterImportRange[1]);
        if (charAfterImport === '\n') {
          fixes.push(fixer.removeRange(charAfterImportRange));
        }
      }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}

    return fixes;
  };
}

function checkImports(imported, context) {var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {
    for (var _iterator3 = imported.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var _ref5 = _step3.value;var _ref6 = _slicedToArray(_ref5, 2);var _module = _ref6[0];var nodes = _ref6[1];
      if (nodes.length > 1) {
        var message = '\'' + String(_module) + '\' imported multiple times.';var _nodes = _toArray(
        nodes),first = _nodes[0],rest = _nodes.slice(1);
        var sourceCode = (0, _contextCompat.getSourceCode)(context);
        var fix = getFix(first, rest, sourceCode, context);

        context.report({
          node: first.source,
          message: message,
          fix: fix // Attach the autofix (if any) to the first import.
        });var _iteratorNormalCompletion4 = true;var _didIteratorError4 = false;var _iteratorError4 = undefined;try {

          for (var _iterator4 = rest[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {var node = _step4.value;
            context.report({
              node: node.source,
              message: message });

          }} catch (err) {_didIteratorError4 = true;_iteratorError4 = err;} finally {try {if (!_iteratorNormalCompletion4 && _iterator4['return']) {_iterator4['return']();}} finally {if (_didIteratorError4) {throw _iteratorError4;}}}
      }
    }} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3['return']) {_iterator3['return']();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      category: 'Style guide',
      description: 'Forbid repeated import of the same module in multiple places.',
      url: (0, _docsUrl2['default'])('no-duplicates') },

    fixable: 'code',
    schema: [
    {
      type: 'object',
      properties: {
        considerQueryString: {
          type: 'boolean' },

        'prefer-inline': {
          type: 'boolean' } },


      additionalProperties: false }] },




  create: function () {function create(context) {
      // Prepare the resolver from options.
      var considerQueryStringOption = context.options[0] &&
      context.options[0].considerQueryString;
      var defaultResolver = function () {function defaultResolver(sourcePath) {return (0, _resolve2['default'])(sourcePath, context) || sourcePath;}return defaultResolver;}();
      var resolver = considerQueryStringOption ? function (sourcePath) {
        var parts = sourcePath.match(/^([^?]*)\?(.*)$/);
        if (!parts) {
          return defaultResolver(sourcePath);
        }
        return String(defaultResolver(parts[1])) + '?' + String(parts[2]);
      } : defaultResolver;

      var moduleMaps = new Map();

      function getImportMap(n) {
        if (!moduleMaps.has(n.parent)) {
          moduleMaps.set(n.parent, {
            imported: new Map(),
            nsImported: new Map(),
            defaultTypesImported: new Map(),
            namedTypesImported: new Map() });

        }
        var map = moduleMaps.get(n.parent);
        var preferInline = context.options[0] && context.options[0]['prefer-inline'];
        if (!preferInline && n.importKind === 'type') {
          return n.specifiers.length > 0 && n.specifiers[0].type === 'ImportDefaultSpecifier' ? map.defaultTypesImported : map.namedTypesImported;
        }
        if (!preferInline && n.specifiers.some(function (spec) {return spec.importKind === 'type';})) {
          return map.namedTypesImported;
        }

        return hasNamespace(n) ? map.nsImported : map.imported;
      }

      return {
        ImportDeclaration: function () {function ImportDeclaration(n) {
            // resolved path will cover aliased duplicates
            var resolvedPath = resolver(n.source.value);
            var importMap = getImportMap(n);

            if (importMap.has(resolvedPath)) {
              importMap.get(resolvedPath).push(n);
            } else {
              importMap.set(resolvedPath, [n]);
            }
          }return ImportDeclaration;}(),

        'Program:exit': function () {function ProgramExit() {var _iteratorNormalCompletion5 = true;var _didIteratorError5 = false;var _iteratorError5 = undefined;try {
              for (var _iterator5 = moduleMaps.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {var map = _step5.value;
                checkImports(map.imported, context);
                checkImports(map.nsImported, context);
                checkImports(map.defaultTypesImported, context);
                checkImports(map.namedTypesImported, context);
              }} catch (err) {_didIteratorError5 = true;_iteratorError5 = err;} finally {try {if (!_iteratorNormalCompletion5 && _iterator5['return']) {_iterator5['return']();}} finally {if (_didIteratorError5) {throw _iteratorError5;}}}
          }return ProgramExit;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1kdXBsaWNhdGVzLmpzIl0sIm5hbWVzIjpbInR5cGVzY3JpcHRQa2ciLCJyZXF1aXJlIiwiZSIsImlzUHVuY3R1YXRvciIsIm5vZGUiLCJ2YWx1ZSIsInR5cGUiLCJnZXREZWZhdWx0SW1wb3J0TmFtZSIsImRlZmF1bHRTcGVjaWZpZXIiLCJzcGVjaWZpZXJzIiwiZmluZCIsInNwZWNpZmllciIsImxvY2FsIiwibmFtZSIsInVuZGVmaW5lZCIsImhhc05hbWVzcGFjZSIsImZpbHRlciIsImxlbmd0aCIsImhhc1NwZWNpZmllcnMiLCJoYXNDb21tZW50QmVmb3JlIiwic291cmNlQ29kZSIsImdldENvbW1lbnRzQmVmb3JlIiwic29tZSIsImNvbW1lbnQiLCJsb2MiLCJlbmQiLCJsaW5lIiwic3RhcnQiLCJoYXNDb21tZW50QWZ0ZXIiLCJnZXRDb21tZW50c0FmdGVyIiwiaGFzQ29tbWVudEluc2lkZU5vblNwZWNpZmllcnMiLCJ0b2tlbnMiLCJnZXRUb2tlbnMiLCJvcGVuQnJhY2VJbmRleCIsImZpbmRJbmRleCIsInRva2VuIiwiY2xvc2VCcmFjZUluZGV4Iiwic29tZVRva2VucyIsInNsaWNlIiwiY29uY2F0IiwiaGFzUHJvYmxlbWF0aWNDb21tZW50cyIsImdldEZpeCIsImZpcnN0IiwicmVzdCIsImNvbnRleHQiLCJkZWZhdWx0SW1wb3J0TmFtZXMiLCJTZXQiLCJ4Iiwic2l6ZSIsInJlc3RXaXRob3V0Q29tbWVudHMiLCJtYXAiLCJvcGVuQnJhY2UiLCJjbG9zZUJyYWNlIiwiaW1wb3J0Tm9kZSIsImlkZW50aWZpZXJzIiwidGV4dCIsInJhbmdlIiwic3BsaXQiLCJpc0VtcHR5IiwiQm9vbGVhbiIsInVubmVjZXNzYXJ5SW1wb3J0cyIsInNob3VsZEFkZERlZmF1bHQiLCJzaG91bGRBZGRTcGVjaWZpZXJzIiwic2hvdWxkUmVtb3ZlVW5uZWNlc3NhcnkiLCJwcmVmZXJJbmxpbmUiLCJvcHRpb25zIiwiZml4ZXIiLCJmaXJzdFRva2VuIiwiZ2V0Rmlyc3RUb2tlbiIsImRlZmF1bHRJbXBvcnROYW1lIiwiZmlyc3RIYXNUcmFpbGluZ0NvbW1hIiwiZ2V0VG9rZW5CZWZvcmUiLCJmaXJzdElzRW1wdHkiLCJmaXJzdEV4aXN0aW5nSWRlbnRpZmllcnMiLCJ0cmltIiwicmVkdWNlIiwicmVzdWx0IiwibmVlZHNDb21tYSIsImV4aXN0aW5nSWRlbnRpZmllcnMiLCJpc1R5cGVTcGVjaWZpZXIiLCJpbXBvcnRLaW5kIiwic2VtdmVyIiwic2F0aXNmaWVzIiwidmVyc2lvbiIsIkVycm9yIiwiY3VyIiwic2V0IiwidHJpbW1lZCIsImN1cldpdGhUeXBlIiwiaGFzIiwiYWRkIiwic3BlY2lmaWVyVGV4dCIsInVwZGF0ZWRFeGlzdGluZ0lkZW50aWZpZXJzIiwic3BlY2lmaWVyc1RleHQiLCJmaXhlcyIsInR5cGVJZGVudGlmaWVyVG9rZW4iLCJwdXNoIiwicmVtb3ZlUmFuZ2UiLCJmb3JFYWNoIiwiaWRlbnRpZmllciIsInJlcGxhY2VUZXh0UmFuZ2UiLCJpbnNlcnRUZXh0QWZ0ZXIiLCJpbnNlcnRUZXh0QmVmb3JlIiwicmVtb3ZlIiwiY2hhckFmdGVySW1wb3J0UmFuZ2UiLCJjaGFyQWZ0ZXJJbXBvcnQiLCJzdWJzdHJpbmciLCJjaGVja0ltcG9ydHMiLCJpbXBvcnRlZCIsImVudHJpZXMiLCJtb2R1bGUiLCJub2RlcyIsIm1lc3NhZ2UiLCJmaXgiLCJyZXBvcnQiLCJzb3VyY2UiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwiZml4YWJsZSIsInNjaGVtYSIsInByb3BlcnRpZXMiLCJjb25zaWRlclF1ZXJ5U3RyaW5nIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJjcmVhdGUiLCJjb25zaWRlclF1ZXJ5U3RyaW5nT3B0aW9uIiwiZGVmYXVsdFJlc29sdmVyIiwic291cmNlUGF0aCIsInJlc29sdmVyIiwicGFydHMiLCJtYXRjaCIsIm1vZHVsZU1hcHMiLCJNYXAiLCJnZXRJbXBvcnRNYXAiLCJuIiwicGFyZW50IiwibnNJbXBvcnRlZCIsImRlZmF1bHRUeXBlc0ltcG9ydGVkIiwibmFtZWRUeXBlc0ltcG9ydGVkIiwiZ2V0Iiwic3BlYyIsIkltcG9ydERlY2xhcmF0aW9uIiwicmVzb2x2ZWRQYXRoIiwiaW1wb3J0TWFwIiwidmFsdWVzIl0sIm1hcHBpbmdzIjoicW9CQUFBO0FBQ0Esc0Q7QUFDQSxnQztBQUNBLHlEOztBQUVBLHFDOztBQUVBLElBQUlBLHNCQUFKO0FBQ0EsSUFBSTtBQUNGQSxrQkFBZ0JDLFFBQVEseUJBQVIsQ0FBaEIsQ0FERSxDQUNrRDtBQUNyRCxDQUZELENBRUUsT0FBT0MsQ0FBUCxFQUFVLENBQUUsSUFBTTs7QUFFcEIsU0FBU0MsWUFBVCxDQUFzQkMsSUFBdEIsRUFBNEJDLEtBQTVCLEVBQW1DO0FBQ2pDLFNBQU9ELEtBQUtFLElBQUwsS0FBYyxZQUFkLElBQThCRixLQUFLQyxLQUFMLEtBQWVBLEtBQXBEO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFTRSxvQkFBVCxDQUE4QkgsSUFBOUIsRUFBb0M7QUFDbEMsTUFBTUksbUJBQW1CSixLQUFLSyxVQUFMO0FBQ3RCQyxNQURzQixDQUNqQixVQUFDQyxTQUFELFVBQWVBLFVBQVVMLElBQVYsS0FBbUIsd0JBQWxDLEVBRGlCLENBQXpCO0FBRUEsU0FBT0Usb0JBQW9CLElBQXBCLEdBQTJCQSxpQkFBaUJJLEtBQWpCLENBQXVCQyxJQUFsRCxHQUF5REMsU0FBaEU7QUFDRDs7QUFFRDtBQUNBLFNBQVNDLFlBQVQsQ0FBc0JYLElBQXRCLEVBQTRCO0FBQzFCLE1BQU1LLGFBQWFMLEtBQUtLLFVBQUw7QUFDaEJPLFFBRGdCLENBQ1QsVUFBQ0wsU0FBRCxVQUFlQSxVQUFVTCxJQUFWLEtBQW1CLDBCQUFsQyxFQURTLENBQW5CO0FBRUEsU0FBT0csV0FBV1EsTUFBWCxHQUFvQixDQUEzQjtBQUNEOztBQUVEO0FBQ0EsU0FBU0MsYUFBVCxDQUF1QmQsSUFBdkIsRUFBNkI7QUFDM0IsTUFBTUssYUFBYUwsS0FBS0ssVUFB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QUFrQnZGLElBQUl5RixVQUF0QixHQUFtQ3pGLElBQUkwRCxRQUE5QztBQUNEOztBQUVELGFBQU87QUFDTG9DLHlCQURLLDBDQUNhUCxDQURiLEVBQ2dCO0FBQ25CO0FBQ0EsZ0JBQU1RLGVBQWVkLFNBQVNNLEVBQUV0QixNQUFGLENBQVM5RyxLQUFsQixDQUFyQjtBQUNBLGdCQUFNNkksWUFBWVYsYUFBYUMsQ0FBYixDQUFsQjs7QUFFQSxnQkFBSVMsVUFBVXpELEdBQVYsQ0FBY3dELFlBQWQsQ0FBSixFQUFpQztBQUMvQkMsd0JBQVVKLEdBQVYsQ0FBY0csWUFBZCxFQUE0QmpELElBQTVCLENBQWlDeUMsQ0FBakM7QUFDRCxhQUZELE1BRU87QUFDTFMsd0JBQVU1RCxHQUFWLENBQWMyRCxZQUFkLEVBQTRCLENBQUNSLENBQUQsQ0FBNUI7QUFDRDtBQUNGLFdBWEk7O0FBYUwsc0JBYkssc0NBYVk7QUFDZixvQ0FBa0JILFdBQVdhLE1BQVgsRUFBbEIsbUlBQXVDLEtBQTVCakcsR0FBNEI7QUFDckN5RCw2QkFBYXpELElBQUkwRCxRQUFqQixFQUEyQmhFLE9BQTNCO0FBQ0ErRCw2QkFBYXpELElBQUl5RixVQUFqQixFQUE2Qi9GLE9BQTdCO0FBQ0ErRCw2QkFBYXpELElBQUkwRixvQkFBakIsRUFBdUNoRyxPQUF2QztBQUNBK0QsNkJBQWF6RCxJQUFJMkYsa0JBQWpCLEVBQXFDakcsT0FBckM7QUFDRCxlQU5jO0FBT2hCLFdBcEJJLHdCQUFQOztBQXNCRCxLQW5GYyxtQkFBakIiLCJmaWxlIjoibm8tZHVwbGljYXRlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldFNvdXJjZUNvZGUgfSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL2NvbnRleHRDb21wYXQnO1xuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJztcbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCBmbGF0TWFwIGZyb20gJ2FycmF5LnByb3RvdHlwZS5mbGF0bWFwJztcblxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XG5cbmxldCB0eXBlc2NyaXB0UGtnO1xudHJ5IHtcbiAgdHlwZXNjcmlwdFBrZyA9IHJlcXVpcmUoJ3R5cGVzY3JpcHQvcGFja2FnZS5qc29uJyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG59IGNhdGNoIChlKSB7IC8qKi8gfVxuXG5mdW5jdGlvbiBpc1B1bmN0dWF0b3Iobm9kZSwgdmFsdWUpIHtcbiAgcmV0dXJuIG5vZGUudHlwZSA9PT0gJ1B1bmN0dWF0b3InICYmIG5vZGUudmFsdWUgPT09IHZhbHVlO1xufVxuXG4vLyBHZXQgdGhlIG5hbWUgb2YgdGhlIGRlZmF1bHQgaW1wb3J0IG9mIGBub2RlYCwgaWYgYW55LlxuZnVuY3Rpb24gZ2V0RGVmYXVsdEltcG9ydE5hbWUobm9kZSkge1xuICBjb25zdCBkZWZhdWx0U3BlY2lmaWVyID0gbm9kZS5zcGVjaWZpZXJzXG4gICAgLmZpbmQoKHNwZWNpZmllcikgPT4gc3BlY2lmaWVyLnR5cGUgPT09ICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJyk7XG4gIHJldHVybiBkZWZhdWx0U3BlY2lmaWVyICE9IG51bGwgPyBkZWZhdWx0U3BlY2lmaWVyLmxvY2FsLm5hbWUgOiB1bmRlZmluZWQ7XG59XG5cbi8vIENoZWNrcyB3aGV0aGVyIGBub2RlYCBoYXMgYSBuYW1lc3BhY2UgaW1wb3J0LlxuZnVuY3Rpb24gaGFzTmFtZXNwYWNlKG5vZGUpIHtcbiAgY29uc3Qgc3BlY2lmaWVycyA9IG5vZGUuc3BlY2lmaWVyc1xuICAgIC5maWx0ZXIoKHNwZWNpZmllcikgPT4gc3BlY2lmaWVyLnR5cGUgPT09ICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInKTtcbiAgcmV0dXJuIHNwZWNpZmllcnMubGVuZ3RoID4gMDtcbn1cblxuLy8gQ2hlY2tzIHdoZXRoZXIgYG5vZGVgIGhhcyBhbnkgbm9uLWRlZmF1bHQgc3BlY2lmaWVycy5cbmZ1bmN0aW9uIGhhc1NwZWNpZmllcnMobm9kZSkge1xuICBjb25zdCBzcGVjaWZpZXJzID0gbm9kZS5zcGVjaWZpZXJzXG4gICAgLmZpbHRlcigoc3BlY2lmaWVyKSA9PiBzcGVjaWZpZXIudHlwZSA9PT0gJ0ltcG9ydFNwZWNpZmllcicpO1xuICByZXR1cm4gc3BlY2lmaWVycy5sZW5ndGggPiAwO1xufVxuXG4vLyBDaGVja3Mgd2hldGhlciBgbm9kZWAgaGFzIGEgY29tbWVudCAodGhhdCBlbmRzKSBvbiB0aGUgcHJldmlvdXMgbGluZSBvciBvblxuLy8gdGhlIHNhbWUgbGluZSBhcyBgbm9kZWAgKHN0YXJ0cykuXG5mdW5jdGlvbiBoYXNDb21tZW50QmVmb3JlKG5vZGUsIHNvdXJjZUNvZGUpIHtcbiAgcmV0dXJuIHNvdXJjZUNvZGUuZ2V0Q29tbWVudHNCZWZvcmUobm9kZSlcbiAgICAuc29tZSgoY29tbWVudCkgPT4gY29tbWVudC5sb2MuZW5kLmxpbmUgPj0gbm9kZS5sb2Muc3RhcnQubGluZSAtIDEpO1xufVxuXG4vLyBDaGVja3Mgd2hldGhlciBgbm9kZWAgaGFzIGEgY29tbWVudCAodGhhdCBzdGFydHMpIG9uIHRoZSBzYW1lIGxpbmUgYXMgYG5vZGVgXG4vLyAoZW5kcykuXG5mdW5jdGlvbiBoYXNDb21tZW50QWZ0ZXIobm9kZSwgc291cmNlQ29kZSkge1xuICByZXR1cm4gc291cmNlQ29kZS5nZXRDb21tZW50c0FmdGVyKG5vZGUpXG4gICAgLnNvbWUoKGNvbW1lbnQpID0+IGNvbW1lbnQubG9jLnN0YXJ0LmxpbmUgPT09IG5vZGUubG9jLmVuZC5saW5lKTtcbn1cblxuLy8gQ2hlY2tzIHdoZXRoZXIgYG5vZGVgIGhhcyBhbnkgY29tbWVudHMgX2luc2lkZSxfIGV4Y2VwdCBpbnNpZGUgdGhlIGB7Li4ufWBcbi8vIHBhcnQgKGlmIGFueSkuXG5mdW5jdGlvbiBoYXNDb21tZW50SW5zaWRlTm9uU3BlY2lmaWVycyhub2RlLCBzb3VyY2VDb2RlKSB7XG4gIGNvbnN0IHRva2VucyA9IHNvdXJjZUNvZGUuZ2V0VG9rZW5zKG5vZGUpO1xuICBjb25zdCBvcGVuQnJhY2VJbmRleCA9IHRva2Vucy5maW5kSW5kZXgoKHRva2VuKSA9PiBpc1B1bmN0dWF0b3IodG9rZW4sICd7JykpO1xuICBjb25zdCBjbG9zZUJyYWNlSW5kZXggPSB0b2tlbnMuZmluZEluZGV4KCh0b2tlbikgPT4gaXNQdW5jdHVhdG9yKHRva2VuLCAnfScpKTtcbiAgLy8gU2xpY2UgYXdheSB0aGUgZmlyc3QgdG9rZW4sIHNpbmNlIHdlJ3JlIG5vIGxvb2tpbmcgZm9yIGNvbW1lbnRzIF9iZWZvcmVfXG4gIC8vIGBub2RlYCAob25seSBpbnNpZGUpLiBJZiB0aGVyZSdzIGEgYHsuLi59YCBwYXJ0LCBsb29rIGZvciBjb21tZW50cyBiZWZvcmVcbiAgLy8gdGhlIGB7YCwgYnV0IG5vdCBiZWZvcmUgdGhlIGB9YCAoaGVuY2UgdGhlIGArMWBzKS5cbiAgY29uc3Qgc29tZVRva2VucyA9IG9wZW5CcmFjZUluZGV4ID49IDAgJiYgY2xvc2VCcmFjZUluZGV4ID49IDBcbiAgICA/IHRva2Vucy5zbGljZSgxLCBvcGVuQnJhY2VJbmRleCArIDEpLmNvbmNhdCh0b2tlbnMuc2xpY2UoY2xvc2VCcmFjZUluZGV4ICsgMSkpXG4gICAgOiB0b2tlbnMuc2xpY2UoMSk7XG4gIHJldHVybiBzb21lVG9rZW5zLnNvbWUoKHRva2VuKSA9PiBzb3VyY2VDb2RlLmdldENvbW1lbnRzQmVmb3JlKHRva2VuKS5sZW5ndGggPiAwKTtcbn1cblxuLy8gSXQncyBub3Qgb2J2aW91cyB3aGF0IHRoZSB1c2VyIHdhbnRzIHRvIGRvIHdpdGggY29tbWVudHMgYXNzb2NpYXRlZCB3aXRoXG4vLyBkdXBsaWNhdGUgaW1wb3J0cywgc28gc2tpcCBpbXBvcnRzIHdpdGggY29tbWVudHMgd2hlbiBhdXRvZml4aW5nLlxuZnVuY3Rpb24gaGFzUHJvYmxlbWF0aWNDb21tZW50cyhub2RlLCBzb3VyY2VDb2RlKSB7XG4gIHJldHVybiAoXG4gICAgaGFzQ29tbWVudEJlZm9yZShub2RlLCBzb3VyY2VDb2RlKVxuICAgIHx8IGhhc0NvbW1lbnRBZnRlcihub2RlLCBzb3VyY2VDb2RlKVxuICAgIHx8IGhhc0NvbW1lbnRJbnNpZGVOb25TcGVjaWZpZXJzKG5vZGUsIHNvdXJjZUNvZGUpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldEZpeChmaXJzdCwgcmVzdCwgc291cmNlQ29kZSwgY29udGV4dCkge1xuICAvLyBTb3JyeSBFU0xpbnQgPD0gMyB1c2Vycywgbm8gYXV0b2ZpeCBmb3IgeW91LiBBdXRvZml4aW5nIGR1cGxpY2F0ZSBpbXBvcnRzXG4gIC8vIHJlcXVpcmVzIG11bHRpcGxlIGBmaXhlci53aGF0ZXZlcigpYCBjYWxscyBpbiB0aGUgYGZpeGA6IFdlIGJvdGggbmVlZCB0b1xuICAvLyB1cGRhdGUgdGhlIGZpcnN0IG9uZSwgYW5kIHJlbW92ZSB0aGUgcmVzdC4gU3VwcG9ydCBmb3IgbXVsdGlwbGVcbiAgLy8gYGZpeGVyLndoYXRldmVyKClgIGluIGEgc2luZ2xlIGBmaXhgIHdhcyBhZGRlZCBpbiBFU0xpbnQgNC4xLlxuICAvLyBgc291cmNlQ29kZS5nZXRDb21tZW50c0JlZm9yZWAgd2FzIGFkZGVkIGluIDQuMCwgc28gdGhhdCdzIGFuIGVhc3kgdGhpbmcgdG9cbiAgLy8gY2hlY2sgZm9yLlxuICBpZiAodHlwZW9mIHNvdXJjZUNvZGUuZ2V0Q29tbWVudHNCZWZvcmUgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gQWRqdXN0aW5nIHRoZSBmaXJzdCBpbXBvcnQgbWlnaHQgbWFrZSBpdCBtdWx0aWxpbmUsIHdoaWNoIGNvdWxkIGJyZWFrXG4gIC8vIGBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVgIGNvbW1lbnRzIGFuZCBzaW1pbGFyLCBzbyBiYWlsIGlmIHRoZSBmaXJzdFxuICAvLyBpbXBvcnQgaGFzIGNvbW1lbnRzLiBBbHNvLCBpZiB0aGUgZmlyc3QgaW1wb3J0IGlzIGBpbXBvcnQgKiBhcyBucyBmcm9tXG4gIC8vICcuL2ZvbydgIHRoZXJlJ3Mgbm90aGluZyB3ZSBjYW4gZG8uXG4gIGlmIChoYXNQcm9ibGVtYXRpY0NvbW1lbnRzKGZpcnN0LCBzb3VyY2VDb2RlKSB8fCBoYXNOYW1lc3BhY2UoZmlyc3QpKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNvbnN0IGRlZmF1bHRJbXBvcnROYW1lcyA9IG5ldyBTZXQoXG4gICAgZmxhdE1hcChbXS5jb25jYXQoZmlyc3QsIHJlc3QgfHwgW10pLCAoeCkgPT4gZ2V0RGVmYXVsdEltcG9ydE5hbWUoeCkgfHwgW10pLFxuICApO1xuXG4gIC8vIEJhaWwgaWYgdGhlcmUgYXJlIG11bHRpcGxlIGRpZmZlcmVudCBkZWZhdWx0IGltcG9ydCBuYW1lcyDigJMgaXQncyB1cCB0byB0aGVcbiAgLy8gdXNlciB0byBjaG9vc2Ugd2hpY2ggb25lIHRvIGtlZXAuXG4gIGlmIChkZWZhdWx0SW1wb3J0TmFtZXMuc2l6ZSA+IDEpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gTGVhdmUgaXQgdG8gdGhlIHVzZXIgdG8gaGFuZGxlIGNvbW1lbnRzLiBBbHNvIHNraXAgYGltcG9ydCAqIGFzIG5zIGZyb21cbiAgLy8gJy4vZm9vJ2AgaW1wb3J0cywgc2luY2UgdGhleSBjYW5ub3QgYmUgbWVyZ2VkIGludG8gYW5vdGhlciBpbXBvcnQuXG4gIGNvbnN0IHJlc3RXaXRob3V0Q29tbWVudHMgPSByZXN0LmZpbHRlcigobm9kZSkgPT4gIWhhc1Byb2JsZW1hdGljQ29tbWVudHMobm9kZSwgc291cmNlQ29kZSkgJiYgIWhhc05hbWVzcGFjZShub2RlKSk7XG5cbiAgY29uc3Qgc3BlY2lmaWVycyA9IHJlc3RXaXRob3V0Q29tbWVudHNcbiAgICAubWFwKChub2RlKSA9PiB7XG4gICAgICBjb25zdCB0b2tlbnMgPSBzb3VyY2VDb2RlLmdldFRva2Vucyhub2RlKTtcbiAgICAgIGNvbnN0IG9wZW5CcmFjZSA9IHRva2Vucy5maW5kKCh0b2tlbikgPT4gaXNQdW5jdHVhdG9yKHRva2VuLCAneycpKTtcbiAgICAgIGNvbnN0IGNsb3NlQnJhY2UgPSB0b2tlbnMuZmluZCgodG9rZW4pID0+IGlzUHVuY3R1YXRvcih0b2tlbiwgJ30nKSk7XG5cbiAgICAgIGlmIChvcGVuQnJhY2UgPT0gbnVsbCB8fCBjbG9zZUJyYWNlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaW1wb3J0Tm9kZTogbm9kZSxcbiAgICAgICAgaWRlbnRpZmllcnM6IHNvdXJjZUNvZGUudGV4dC5zbGljZShvcGVuQnJhY2UucmFuZ2VbMV0sIGNsb3NlQnJhY2UucmFuZ2VbMF0pLnNwbGl0KCcsJyksIC8vIFNwbGl0IHRoZSB0ZXh0IGludG8gc2VwYXJhdGUgaWRlbnRpZmllcnMgKHJldGFpbmluZyBhbnkgd2hpdGVzcGFjZSBiZWZvcmUgb3IgYWZ0ZXIpXG4gICAgICAgIGlzRW1wdHk6ICFoYXNTcGVjaWZpZXJzKG5vZGUpLFxuICAgICAgfTtcbiAgICB9KVxuICAgIC5maWx0ZXIoQm9vbGVhbik7XG5cbiAgY29uc3QgdW5uZWNlc3NhcnlJbXBvcnRzID0gcmVzdFdpdGhvdXRDb21tZW50cy5maWx0ZXIoKG5vZGUpID0+ICFoYXNTcGVjaWZpZXJzKG5vZGUpXG4gICAgJiYgIWhhc05hbWVzcGFjZShub2RlKVxuICAgICYmICFzcGVjaWZpZXJzLnNvbWUoKHNwZWNpZmllcikgPT4gc3BlY2lmaWVyLmltcG9ydE5vZGUgPT09IG5vZGUpLFxuICApO1xuXG4gIGNvbnN0IHNob3VsZEFkZERlZmF1bHQgPSBnZXREZWZhdWx0SW1wb3J0TmFtZShmaXJzdCkgPT0gbnVsbCAmJiBkZWZhdWx0SW1wb3J0TmFtZXMuc2l6ZSA9PT0gMTtcbiAgY29uc3Qgc2hvdWxkQWRkU3BlY2lmaWVycyA9IHNwZWNpZmllcnMubGVuZ3RoID4gMDtcbiAgY29uc3Qgc2hvdWxkUmVtb3ZlVW5uZWNlc3NhcnkgPSB1bm5lY2Vzc2FyeUltcG9ydHMubGVuZ3RoID4gMDtcbiAgY29uc3QgcHJlZmVySW5saW5lID0gY29udGV4dC5vcHRpb25zWzBdICYmIGNvbnRleHQub3B0aW9uc1swXVsncHJlZmVyLWlubGluZSddO1xuXG4gIGlmICghKHNob3VsZEFkZERlZmF1bHQgfHwgc2hvdWxkQWRkU3BlY2lmaWVycyB8fCBzaG91bGRSZW1vdmVVbm5lY2Vzc2FyeSkpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIChmaXhlcikgPT4ge1xuICAgIGNvbnN0IHRva2VucyA9IHNvdXJjZUNvZGUuZ2V0VG9rZW5zKGZpcnN0KTtcbiAgICBjb25zdCBvcGVuQnJhY2UgPSB0b2tlbnMuZmluZCgodG9rZW4pID0+IGlzUHVuY3R1YXRvcih0b2tlbiwgJ3snKSk7XG4gICAgY29uc3QgY2xvc2VCcmFjZSA9IHRva2Vucy5maW5kKCh0b2tlbikgPT4gaXNQdW5jdHVhdG9yKHRva2VuLCAnfScpKTtcbiAgICBjb25zdCBmaXJzdFRva2VuID0gc291cmNlQ29kZS5nZXRGaXJzdFRva2VuKGZpcnN0KTtcbiAgICBjb25zdCBbZGVmYXVsdEltcG9ydE5hbWVdID0gZGVmYXVsdEltcG9ydE5hbWVzO1xuXG4gICAgY29uc3QgZmlyc3RIYXNUcmFpbGluZ0NvbW1hID0gY2xvc2VCcmFjZSAhPSBudWxsICYmIGlzUHVuY3R1YXRvcihzb3VyY2VDb2RlLmdldFRva2VuQmVmb3JlKGNsb3NlQnJhY2UpLCAnLCcpO1xuICAgIGNvbnN0IGZpcnN0SXNFbXB0eSA9ICFoYXNTcGVjaWZpZXJzKGZpcnN0KTtcbiAgICBjb25zdCBmaXJzdEV4aXN0aW5nSWRlbnRpZmllcnMgPSBmaXJzdElzRW1wdHlcbiAgICAgID8gbmV3IFNldCgpXG4gICAgICA6IG5ldyBTZXQoc291cmNlQ29kZS50ZXh0LnNsaWNlKG9wZW5CcmFjZS5yYW5nZVsxXSwgY2xvc2VCcmFjZS5yYW5nZVswXSlcbiAgICAgICAgLnNwbGl0KCcsJylcbiAgICAgICAgLm1hcCgoeCkgPT4geC50cmltKCkpLFxuICAgICAgKTtcblxuICAgIGNvbnN0IFtzcGVjaWZpZXJzVGV4dF0gPSBzcGVjaWZpZXJzLnJlZHVjZShcbiAgICAgIChbcmVzdWx0LCBuZWVkc0NvbW1hLCBleGlzdGluZ0lkZW50aWZpZXJzXSwgc3BlY2lmaWVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzVHlwZVNwZWNpZmllciA9IHNwZWNpZmllci5pbXBvcnROb2RlLmltcG9ydEtpbmQgPT09ICd0eXBlJztcblxuICAgICAgICAvLyBhIHVzZXIgbWlnaHQgc2V0IHByZWZlci1pbmxpbmUgYnV0IG5vdCBoYXZlIGEgc3VwcG9ydGluZyBUeXBlU2NyaXB0IHZlcnNpb24uIEZsb3cgZG9lcyBub3Qgc3VwcG9ydCBpbmxpbmUgdHlwZXMgc28gdGhpcyBzaG91bGQgZmFpbCBpbiB0aGF0IGNhc2UgYXMgd2VsbC5cbiAgICAgICAgaWYgKHByZWZlcklubGluZSAmJiAoIXR5cGVzY3JpcHRQa2cgfHwgIXNlbXZlci5zYXRpc2ZpZXModHlwZXNjcmlwdFBrZy52ZXJzaW9uLCAnPj0gNC41JykpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIHZlcnNpb24gb2YgVHlwZVNjcmlwdCBkb2VzIG5vdCBzdXBwb3J0IGlubGluZSB0eXBlIGltcG9ydHMuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgKm9ubHkqIHRoZSBuZXcgaWRlbnRpZmllcnMgdGhhdCBkb24ndCBhbHJlYWR5IGV4aXN0LCBhbmQgdHJhY2sgYW55IG5ldyBpZGVudGlmaWVycyBzbyB3ZSBkb24ndCBhZGQgdGhlbSBhZ2FpbiBpbiB0aGUgbmV4dCBsb29wXG4gICAgICAgIGNvbnN0IFtzcGVjaWZpZXJUZXh0LCB1cGRhdGVkRXhpc3RpbmdJZGVudGlmaWVyc10gPSBzcGVjaWZpZXIuaWRlbnRpZmllcnMucmVkdWNlKChbdGV4dCwgc2V0XSwgY3VyKSA9PiB7XG4gICAgICAgICAgY29uc3QgdHJpbW1lZCA9IGN1ci50cmltKCk7IC8vIFRyaW0gd2hpdGVzcGFjZSBiZWZvcmUvYWZ0ZXIgdG8gY29tcGFyZSB0byBvdXIgc2V0IG9mIGV4aXN0aW5nIGlkZW50aWZpZXJzXG4gICAgICAgICAgY29uc3QgY3VyV2l0aFR5cGUgPSB0cmltbWVkLmxlbmd0aCA+IDAgJiYgcHJlZmVySW5saW5lICYmIGlzVHlwZVNwZWNpZmllciA/IGB0eXBlICR7Y3VyfWAgOiBjdXI7XG4gICAgICAgICAgaWYgKGV4aXN0aW5nSWRlbnRpZmllcnMuaGFzKHRyaW1tZWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gW3RleHQsIHNldF07XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBbdGV4dC5sZW5ndGggPiAwID8gYCR7dGV4dH0sJHtjdXJXaXRoVHlwZX1gIDogY3VyV2l0aFR5cGUsIHNldC5hZGQodHJpbW1lZCldO1xuICAgICAgICB9LCBbJycsIGV4aXN0aW5nSWRlbnRpZmllcnNdKTtcblxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIG5lZWRzQ29tbWEgJiYgIXNwZWNpZmllci5pc0VtcHR5ICYmIHNwZWNpZmllclRleHQubGVuZ3RoID4gMFxuICAgICAgICAgICAgPyBgJHtyZXN1bHR9LCR7c3BlY2lmaWVyVGV4dH1gXG4gICAgICAgICAgICA6IGAke3Jlc3VsdH0ke3NwZWNpZmllclRleHR9YCxcbiAgICAgICAgICBzcGVjaWZpZXIuaXNFbXB0eSA/IG5lZWRzQ29tbWEgOiB0cnVlLFxuICAgICAgICAgIHVwZGF0ZWRFeGlzdGluZ0lkZW50aWZpZXJzLFxuICAgICAgICBdO1xuICAgICAgfSxcbiAgICAgIFsnJywgIWZpcnN0SGFzVHJhaWxpbmdDb21tYSAmJiAhZmlyc3RJc0VtcHR5LCBmaXJzdEV4aXN0aW5nSWRlbnRpZmllcnNdLFxuICAgICk7XG5cbiAgICBjb25zdCBmaXhlcyA9IFtdO1xuXG4gICAgaWYgKHNob3VsZEFkZFNwZWNpZmllcnMgJiYgcHJlZmVySW5saW5lICYmIGZpcnN0LmltcG9ydEtpbmQgPT09ICd0eXBlJykge1xuICAgICAgLy8gYGltcG9ydCB0eXBlIHthfSBmcm9tICcuL2ZvbydgIOKGkiBgaW1wb3J0IHt0eXBlIGF9IGZyb20gJy4vZm9vJ2BcbiAgICAgIGNvbnN0IHR5cGVJZGVudGlmaWVyVG9rZW4gPSB0b2tlbnMuZmluZCgodG9rZW4pID0+IHRva2VuLnR5cGUgPT09ICdJZGVudGlmaWVyJyAmJiB0b2tlbi52YWx1ZSA9PT0gJ3R5cGUnKTtcbiAgICAgIGZpeGVzLnB1c2goZml4ZXIucmVtb3ZlUmFuZ2UoW3R5cGVJZGVudGlmaWVyVG9rZW4ucmFuZ2VbMF0sIHR5cGVJZGVudGlmaWVyVG9rZW4ucmFuZ2VbMV0gKyAxXSkpO1xuXG4gICAgICB0b2tlbnNcbiAgICAgICAgLmZpbHRlcigodG9rZW4pID0+IGZpcnN0RXhpc3RpbmdJZGVudGlmaWVycy5oYXModG9rZW4udmFsdWUpKVxuICAgICAgICAuZm9yRWFjaCgoaWRlbnRpZmllcikgPT4ge1xuICAgICAgICAgIGZpeGVzLnB1c2goZml4ZXIucmVwbGFjZVRleHRSYW5nZShbaWRlbnRpZmllci5yYW5nZVswXSwgaWRlbnRpZmllci5yYW5nZVsxXV0sIGB0eXBlICR7aWRlbnRpZmllci52YWx1ZX1gKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChzaG91bGRBZGREZWZhdWx0ICYmIG9wZW5CcmFjZSA9PSBudWxsICYmIHNob3VsZEFkZFNwZWNpZmllcnMpIHtcbiAgICAgIC8vIGBpbXBvcnQgJy4vZm9vJ2Ag4oaSIGBpbXBvcnQgZGVmLCB7Li4ufSBmcm9tICcuL2ZvbydgXG4gICAgICBmaXhlcy5wdXNoKFxuICAgICAgICBmaXhlci5pbnNlcnRUZXh0QWZ0ZXIoZmlyc3RUb2tlbiwgYCAke2RlZmF1bHRJbXBvcnROYW1lfSwgeyR7c3BlY2lmaWVyc1RleHR9fSBmcm9tYCksXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoc2hvdWxkQWRkRGVmYXVsdCAmJiBvcGVuQnJhY2UgPT0gbnVsbCAmJiAhc2hvdWxkQWRkU3BlY2lmaWVycykge1xuICAgICAgLy8gYGltcG9ydCAnLi9mb28nYCDihpIgYGltcG9ydCBkZWYgZnJvbSAnLi9mb28nYFxuICAgICAgZml4ZXMucHVzaChmaXhlci5pbnNlcnRUZXh0QWZ0ZXIoZmlyc3RUb2tlbiwgYCAke2RlZmF1bHRJbXBvcnROYW1lfSBmcm9tYCkpO1xuICAgIH0gZWxzZSBpZiAoc2hvdWxkQWRkRGVmYXVsdCAmJiBvcGVuQnJhY2UgIT0gbnVsbCAmJiBjbG9zZUJyYWNlICE9IG51bGwpIHtcbiAgICAgIC8vIGBpbXBvcnQgey4uLn0gZnJvbSAnLi9mb28nYCDihpIgYGltcG9ydCBkZWYsIHsuLi59IGZyb20gJy4vZm9vJ2BcbiAgICAgIGZpeGVzLnB1c2goZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKGZpcnN0VG9rZW4sIGAgJHtkZWZhdWx0SW1wb3J0TmFtZX0sYCkpO1xuICAgICAgaWYgKHNob3VsZEFkZFNwZWNpZmllcnMpIHtcbiAgICAgICAgLy8gYGltcG9ydCBkZWYsIHsuLi59IGZyb20gJy4vZm9vJ2Ag4oaSIGBpbXBvcnQgZGVmLCB7Li4uLCAuLi59IGZyb20gJy4vZm9vJ2BcbiAgICAgICAgZml4ZXMucHVzaChmaXhlci5pbnNlcnRUZXh0QmVmb3JlKGNsb3NlQnJhY2UsIHNwZWNpZmllcnNUZXh0KSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghc2hvdWxkQWRkRGVmYXVsdCAmJiBvcGVuQnJhY2UgPT0gbnVsbCAmJiBzaG91bGRBZGRTcGVjaWZpZXJzKSB7XG4gICAgICBpZiAoZmlyc3Quc3BlY2lmaWVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gYGltcG9ydCAnLi9mb28nYCDihpIgYGltcG9ydCB7Li4ufSBmcm9tICcuL2ZvbydgXG4gICAgICAgIGZpeGVzLnB1c2goZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKGZpcnN0VG9rZW4sIGAgeyR7c3BlY2lmaWVyc1RleHR9fSBmcm9tYCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYGltcG9ydCBkZWYgZnJvbSAnLi9mb28nYCDihpIgYGltcG9ydCBkZWYsIHsuLi59IGZyb20gJy4vZm9vJ2BcbiAgICAgICAgZml4ZXMucHVzaChmaXhlci5pbnNlcnRUZXh0QWZ0ZXIoZmlyc3Quc3BlY2lmaWVyc1swXSwgYCwgeyR7c3BlY2lmaWVyc1RleHR9fWApKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFzaG91bGRBZGREZWZhdWx0ICYmIG9wZW5CcmFjZSAhPSBudWxsICYmIGNsb3NlQnJhY2UgIT0gbnVsbCkge1xuICAgICAgLy8gYGltcG9ydCB7Li4ufSAnLi9mb28nYCDihpIgYGltcG9ydCB7Li4uLCAuLi59IGZyb20gJy4vZm9vJ2BcbiAgICAgIGZpeGVzLnB1c2goZml4ZXIuaW5zZXJ0VGV4dEJlZm9yZShjbG9zZUJyYWNlLCBzcGVjaWZpZXJzVGV4dCkpO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBpbXBvcnRzIHdob3NlIHNwZWNpZmllcnMgaGF2ZSBiZWVuIG1vdmVkIGludG8gdGhlIGZpcnN0IGltcG9ydC5cbiAgICBmb3IgKGNvbnN0IHNwZWNpZmllciBvZiBzcGVjaWZpZXJzKSB7XG4gICAgICBjb25zdCBpbXBvcnROb2RlID0gc3BlY2lmaWVyLmltcG9ydE5vZGU7XG4gICAgICBmaXhlcy5wdXNoKGZpeGVyLnJlbW92ZShpbXBvcnROb2RlKSk7XG5cbiAgICAgIGNvbnN0IGNoYXJBZnRlckltcG9ydFJhbmdlID0gW2ltcG9ydE5vZGUucmFuZ2VbMV0sIGltcG9ydE5vZGUucmFuZ2VbMV0gKyAxXTtcbiAgICAgIGNvbnN0IGNoYXJBZnRlckltcG9ydCA9IHNvdXJjZUNvZGUudGV4dC5zdWJzdHJpbmcoY2hhckFmdGVySW1wb3J0UmFuZ2VbMF0sIGNoYXJBZnRlckltcG9ydFJhbmdlWzFdKTtcbiAgICAgIGlmIChjaGFyQWZ0ZXJJbXBvcnQgPT09ICdcXG4nKSB7XG4gICAgICAgIGZpeGVzLnB1c2goZml4ZXIucmVtb3ZlUmFuZ2UoY2hhckFmdGVySW1wb3J0UmFuZ2UpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgaW1wb3J0cyB3aG9zZSBkZWZhdWx0IGltcG9ydCBoYXMgYmVlbiBtb3ZlZCB0byB0aGUgZmlyc3QgaW1wb3J0LFxuICAgIC8vIGFuZCBzaWRlLWVmZmVjdC1vbmx5IGltcG9ydHMgdGhhdCBhcmUgdW5uZWNlc3NhcnkgZHVlIHRvIHRoZSBmaXJzdFxuICAgIC8vIGltcG9ydC5cbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgdW5uZWNlc3NhcnlJbXBvcnRzKSB7XG4gICAgICBmaXhlcy5wdXNoKGZpeGVyLnJlbW92ZShub2RlKSk7XG5cbiAgICAgIGNvbnN0IGNoYXJBZnRlckltcG9ydFJhbmdlID0gW25vZGUucmFuZ2VbMV0sIG5vZGUucmFuZ2VbMV0gKyAxXTtcbiAgICAgIGNvbnN0IGNoYXJBZnRlckltcG9ydCA9IHNvdXJjZUNvZGUudGV4dC5zdWJzdHJpbmcoY2hhckFmdGVySW1wb3J0UmFuZ2VbMF0sIGNoYXJBZnRlckltcG9ydFJhbmdlWzFdKTtcbiAgICAgIGlmIChjaGFyQWZ0ZXJJbXBvcnQgPT09ICdcXG4nKSB7XG4gICAgICAgIGZpeGVzLnB1c2goZml4ZXIucmVtb3ZlUmFuZ2UoY2hhckFmdGVySW1wb3J0UmFuZ2UpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZml4ZXM7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNoZWNrSW1wb3J0cyhpbXBvcnRlZCwgY29udGV4dCkge1xuICBmb3IgKGNvbnN0IFttb2R1bGUsIG5vZGVzXSBvZiBpbXBvcnRlZC5lbnRyaWVzKCkpIHtcbiAgICBpZiAobm9kZXMubGVuZ3RoID4gMSkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGAnJHttb2R1bGV9JyBpbXBvcnRlZCBtdWx0aXBsZSB0aW1lcy5gO1xuICAgICAgY29uc3QgW2ZpcnN0LCAuLi5yZXN0XSA9IG5vZGVzO1xuICAgICAgY29uc3Qgc291cmNlQ29kZSA9IGdldFNvdXJjZUNvZGUoY29udGV4dCk7XG4gICAgICBjb25zdCBmaXggPSBnZXRGaXgoZmlyc3QsIHJlc3QsIHNvdXJjZUNvZGUsIGNvbnRleHQpO1xuXG4gICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgIG5vZGU6IGZpcnN0LnNvdXJjZSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgZml4LCAvLyBBdHRhY2ggdGhlIGF1dG9maXggKGlmIGFueSkgdG8gdGhlIGZpcnN0IGltcG9ydC5cbiAgICAgIH0pO1xuXG4gICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcmVzdCkge1xuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgbm9kZTogbm9kZS5zb3VyY2UsXG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgdHlwZTogJ3Byb2JsZW0nLFxuICAgIGRvY3M6IHtcbiAgICAgIGNhdGVnb3J5OiAnU3R5bGUgZ3VpZGUnLFxuICAgICAgZGVzY3JpcHRpb246ICdGb3JiaWQgcmVwZWF0ZWQgaW1wb3J0IG9mIHRoZSBzYW1lIG1vZHVsZSBpbiBtdWx0aXBsZSBwbGFjZXMuJyxcbiAgICAgIHVybDogZG9jc1VybCgnbm8tZHVwbGljYXRlcycpLFxuICAgIH0sXG4gICAgZml4YWJsZTogJ2NvZGUnLFxuICAgIHNjaGVtYTogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgIGNvbnNpZGVyUXVlcnlTdHJpbmc6IHtcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgICdwcmVmZXItaW5saW5lJzoge1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcblxuICBjcmVhdGUoY29udGV4dCkge1xuICAgIC8vIFByZXBhcmUgdGhlIHJlc29sdmVyIGZyb20gb3B0aW9ucy5cbiAgICBjb25zdCBjb25zaWRlclF1ZXJ5U3RyaW5nT3B0aW9uID0gY29udGV4dC5vcHRpb25zWzBdXG4gICAgICAmJiBjb250ZXh0Lm9wdGlvbnNbMF0uY29uc2lkZXJRdWVyeVN0cmluZztcbiAgICBjb25zdCBkZWZhdWx0UmVzb2x2ZXIgPSAoc291cmNlUGF0aCkgPT4gcmVzb2x2ZShzb3VyY2VQYXRoLCBjb250ZXh0KSB8fCBzb3VyY2VQYXRoO1xuICAgIGNvbnN0IHJlc29sdmVyID0gY29uc2lkZXJRdWVyeVN0cmluZ09wdGlvbiA/IChzb3VyY2VQYXRoKSA9PiB7XG4gICAgICBjb25zdCBwYXJ0cyA9IHNvdXJjZVBhdGgubWF0Y2goL14oW14/XSopXFw/KC4qKSQvKTtcbiAgICAgIGlmICghcGFydHMpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRSZXNvbHZlcihzb3VyY2VQYXRoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgJHtkZWZhdWx0UmVzb2x2ZXIocGFydHNbMV0pfT8ke3BhcnRzWzJdfWA7XG4gICAgfSA6IGRlZmF1bHRSZXNvbHZlcjtcblxuICAgIGNvbnN0IG1vZHVsZU1hcHMgPSBuZXcgTWFwKCk7XG5cbiAgICBmdW5jdGlvbiBnZXRJbXBvcnRNYXAobikge1xuICAgICAgaWYgKCFtb2R1bGVNYXBzLmhhcyhuLnBhcmVudCkpIHtcbiAgICAgICAgbW9kdWxlTWFwcy5zZXQobi5wYXJlbnQsIHtcbiAgICAgICAgICBpbXBvcnRlZDogbmV3IE1hcCgpLFxuICAgICAgICAgIG5zSW1wb3J0ZWQ6IG5ldyBNYXAoKSxcbiAgICAgICAgICBkZWZhdWx0VHlwZXNJbXBvcnRlZDogbmV3IE1hcCgpLFxuICAgICAgICAgIG5hbWVkVHlwZXNJbXBvcnRlZDogbmV3IE1hcCgpLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1hcCA9IG1vZHVsZU1hcHMuZ2V0KG4ucGFyZW50KTtcbiAgICAgIGNvbnN0IHByZWZlcklubGluZSA9IGNvbnRleHQub3B0aW9uc1swXSAmJiBjb250ZXh0Lm9wdGlvbnNbMF1bJ3ByZWZlci1pbmxpbmUnXTtcbiAgICAgIGlmICghcHJlZmVySW5saW5lICYmIG4uaW1wb3J0S2luZCA9PT0gJ3R5cGUnKSB7XG4gICAgICAgIHJldHVybiBuLnNwZWNpZmllcnMubGVuZ3RoID4gMCAmJiBuLnNwZWNpZmllcnNbMF0udHlwZSA9PT0gJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInID8gbWFwLmRlZmF1bHRUeXBlc0ltcG9ydGVkIDogbWFwLm5hbWVkVHlwZXNJbXBvcnRlZDtcbiAgICAgIH1cbiAgICAgIGlmICghcHJlZmVySW5saW5lICYmIG4uc3BlY2lmaWVycy5zb21lKChzcGVjKSA9PiBzcGVjLmltcG9ydEtpbmQgPT09ICd0eXBlJykpIHtcbiAgICAgICAgcmV0dXJuIG1hcC5uYW1lZFR5cGVzSW1wb3J0ZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBoYXNOYW1lc3BhY2UobikgPyBtYXAubnNJbXBvcnRlZCA6IG1hcC5pbXBvcnRlZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgSW1wb3J0RGVjbGFyYXRpb24obikge1xuICAgICAgICAvLyByZXNvbHZlZCBwYXRoIHdpbGwgY292ZXIgYWxpYXNlZCBkdXBsaWNhdGVzXG4gICAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHJlc29sdmVyKG4uc291cmNlLnZhbHVlKTtcbiAgICAgICAgY29uc3QgaW1wb3J0TWFwID0gZ2V0SW1wb3J0TWFwKG4pO1xuXG4gICAgICAgIGlmIChpbXBvcnRNYXAuaGFzKHJlc29sdmVkUGF0aCkpIHtcbiAgICAgICAgICBpbXBvcnRNYXAuZ2V0KHJlc29sdmVkUGF0aCkucHVzaChuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbXBvcnRNYXAuc2V0KHJlc29sdmVkUGF0aCwgW25dKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgJ1Byb2dyYW06ZXhpdCcoKSB7XG4gICAgICAgIGZvciAoY29uc3QgbWFwIG9mIG1vZHVsZU1hcHMudmFsdWVzKCkpIHtcbiAgICAgICAgICBjaGVja0ltcG9ydHMobWFwLmltcG9ydGVkLCBjb250ZXh0KTtcbiAgICAgICAgICBjaGVja0ltcG9ydHMobWFwLm5zSW1wb3J0ZWQsIGNvbnRleHQpO1xuICAgICAgICAgIGNoZWNrSW1wb3J0cyhtYXAuZGVmYXVsdFR5cGVzSW1wb3J0ZWQsIGNvbnRleHQpO1xuICAgICAgICAgIGNoZWNrSW1wb3J0cyhtYXAubmFtZWRUeXBlc0ltcG9ydGVkLCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==