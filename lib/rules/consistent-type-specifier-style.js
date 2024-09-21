'use strict';var _contextCompat = require('eslint-module-utils/contextCompat');

var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function isComma(token) {
  return token.type === 'Punctuator' && token.value === ',';
}

function removeSpecifiers(fixes, fixer, sourceCode, specifiers) {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
    for (var _iterator = specifiers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var specifier = _step.value;
      // remove the trailing comma
      var token = sourceCode.getTokenAfter(specifier);
      if (token && isComma(token)) {
        fixes.push(fixer.remove(token));
      }
      fixes.push(fixer.remove(specifier));
    }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
}

function getImportText(
node,
sourceCode,
specifiers,
kind)
{
  var sourceString = sourceCode.getText(node.source);
  if (specifiers.length === 0) {
    return '';
  }

  var names = specifiers.map(function (s) {
    if (s.imported.name === s.local.name) {
      return s.imported.name;
    }
    return String(s.imported.name) + ' as ' + String(s.local.name);
  });
  // insert a fresh top-level import
  return 'import ' + String(kind) + ' {' + String(names.join(', ')) + '} from ' + String(sourceString) + ';';
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Enforce or ban the use of inline type-only markers for named imports.',
      url: (0, _docsUrl2['default'])('consistent-type-specifier-style') },

    fixable: 'code',
    schema: [
    {
      type: 'string',
      'enum': ['prefer-inline', 'prefer-top-level'],
      'default': 'prefer-inline' }] },




  create: function () {function create(context) {
      var sourceCode = (0, _contextCompat.getSourceCode)(context);

      if (context.options[0] === 'prefer-inline') {
        return {
          ImportDeclaration: function () {function ImportDeclaration(node) {
              if (node.importKind === 'value' || node.importKind == null) {
                // top-level value / unknown is valid
                return;
              }

              if (
              // no specifiers (import type {} from '') have no specifiers to mark as inline
              node.specifiers.length === 0 ||
              node.specifiers.length === 1
              // default imports are both "inline" and "top-level"
              && (
              node.specifiers[0].type === 'ImportDefaultSpecifier'
              // namespace imports are both "inline" and "top-level"
              || node.specifiers[0].type === 'ImportNamespaceSpecifier'))

              {
                return;
              }

              context.report({
                node: node,
                message: 'Prefer using inline {{kind}} specifiers instead of a top-level {{kind}}-only import.',
                data: {
                  kind: node.importKind },

                fix: function () {function fix(fixer) {
                    var kindToken = sourceCode.getFirstToken(node, { skip: 1 });

                    return [].concat(
                    kindToken ? fixer.remove(kindToken) : [],
                    node.specifiers.map(function (specifier) {return fixer.insertTextBefore(specifier, String(node.importKind) + ' ');}));

                  }return fix;}() });

            }return ImportDeclaration;}() };

      }

      // prefer-top-level
      return {
        ImportDeclaration: function () {function ImportDeclaration(node) {
            if (
            // already top-level is valid
            node.importKind === 'type' ||
            node.importKind === 'typeof'
            // no specifiers (import {} from '') cannot have inline - so is valid
            || node.specifiers.length === 0 ||
            node.specifiers.length === 1
            // default imports are both "inline" and "top-level"
            && (
            node.specifiers[0].type === 'ImportDefaultSpecifier'
            // namespace imports are both "inline" and "top-level"
            || node.specifiers[0].type === 'ImportNamespaceSpecifier'))

            {
              return;
            }

            var typeSpecifiers = [];
            var typeofSpecifiers = [];
            var valueSpecifiers = [];
            var defaultSpecifier = null;var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
              for (var _iterator2 = node.specifiers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var specifier = _step2.value;
                if (specifier.type === 'ImportDefaultSpecifier') {
                  defaultSpecifier = specifier;
                  continue;
                }

                if (specifier.importKind === 'type') {
                  typeSpecifiers.push(specifier);
                } else if (specifier.importKind === 'typeof') {
                  typeofSpecifiers.push(specifier);
                } else if (specifier.importKind === 'value' || specifier.importKind == null) {
                  valueSpecifiers.push(specifier);
                }
              }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}

            var typeImport = getImportText(node, sourceCode, typeSpecifiers, 'type');
            var typeofImport = getImportText(node, sourceCode, typeofSpecifiers, 'typeof');
            var newImports = (String(typeImport) + '\n' + String(typeofImport)).trim();

            if (typeSpecifiers.length + typeofSpecifiers.length === node.specifiers.length) {
              // all specifiers have inline specifiers - so we replace the entire import
              var kind = [].concat(
              typeSpecifiers.length > 0 ? 'type' : [],
              typeofSpecifiers.length > 0 ? 'typeof' : []);


              context.report({
                node: node,
                message: 'Prefer using a top-level {{kind}}-only import instead of inline {{kind}} specifiers.',
                data: {
                  kind: kind.join('/') },

                fix: function () {function fix(fixer) {
                    return fixer.replaceText(node, newImports);
                  }return fix;}() });

            } else {
              // remove specific specifiers and insert new imports for them
              var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {for (var _iterator3 = typeSpecifiers.concat(typeofSpecifiers)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var _specifier = _step3.value;
                  context.report({
                    node: _specifier,
                    message: 'Prefer using a top-level {{kind}}-only import instead of inline {{kind}} specifiers.',
                    data: {
                      kind: _specifier.importKind },

                    fix: function () {function fix(fixer) {
                        var fixes = [];

                        // if there are no value specifiers, then the other report fixer will be called, not this one

                        if (valueSpecifiers.length > 0) {
                          // import { Value, type Type } from 'mod';

                          // we can just remove the type specifiers
                          removeSpecifiers(fixes, fixer, sourceCode, typeSpecifiers);
                          removeSpecifiers(fixes, fixer, sourceCode, typeofSpecifiers);

                          // make the import nicely formatted by also removing the trailing comma after the last value import
                          // eg
                          // import { Value, type Type } from 'mod';
                          // to
                          // import { Value  } from 'mod';
                          // not
                          // import { Value,  } from 'mod';
                          var maybeComma = sourceCode.getTokenAfter(valueSpecifiers[valueSpecifiers.length - 1]);
                          if (isComma(maybeComma)) {
                            fixes.push(fixer.remove(maybeComma));
                          }
                        } else if (defaultSpecifier) {
                          // import Default, { type Type } from 'mod';

                          // remove the entire curly block so we don't leave an empty one behind
                          // NOTE - the default specifier *must* be the first specifier always!
                          //        so a comma exists that we also have to clean up or else it's bad syntax
                          var comma = sourceCode.getTokenAfter(defaultSpecifier, isComma);
                          var closingBrace = sourceCode.getTokenAfter(
                          node.specifiers[node.specifiers.length - 1],
                          function (token) {return token.type === 'Punctuator' && token.value === '}';});

                          fixes.push(fixer.removeRange([
                          comma.range[0],
                          closingBrace.range[1]]));

                        }

                        return fixes.concat(
                        // insert the new imports after the old declaration
                        fixer.insertTextAfter(node, '\n' + String(newImports)));

                      }return fix;}() });

                }} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3['return']) {_iterator3['return']();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}
            }
          }return ImportDeclaration;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9jb25zaXN0ZW50LXR5cGUtc3BlY2lmaWVyLXN0eWxlLmpzIl0sIm5hbWVzIjpbImlzQ29tbWEiLCJ0b2tlbiIsInR5cGUiLCJ2YWx1ZSIsInJlbW92ZVNwZWNpZmllcnMiLCJmaXhlcyIsImZpeGVyIiwic291cmNlQ29kZSIsInNwZWNpZmllcnMiLCJzcGVjaWZpZXIiLCJnZXRUb2tlbkFmdGVyIiwicHVzaCIsInJlbW92ZSIsImdldEltcG9ydFRleHQiLCJub2RlIiwia2luZCIsInNvdXJjZVN0cmluZyIsImdldFRleHQiLCJzb3VyY2UiLCJsZW5ndGgiLCJuYW1lcyIsIm1hcCIsInMiLCJpbXBvcnRlZCIsIm5hbWUiLCJsb2NhbCIsImpvaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwiZml4YWJsZSIsInNjaGVtYSIsImNyZWF0ZSIsImNvbnRleHQiLCJvcHRpb25zIiwiSW1wb3J0RGVjbGFyYXRpb24iLCJpbXBvcnRLaW5kIiwicmVwb3J0IiwibWVzc2FnZSIsImRhdGEiLCJmaXgiLCJraW5kVG9rZW4iLCJnZXRGaXJzdFRva2VuIiwic2tpcCIsImNvbmNhdCIsImluc2VydFRleHRCZWZvcmUiLCJ0eXBlU3BlY2lmaWVycyIsInR5cGVvZlNwZWNpZmllcnMiLCJ2YWx1ZVNwZWNpZmllcnMiLCJkZWZhdWx0U3BlY2lmaWVyIiwidHlwZUltcG9ydCIsInR5cGVvZkltcG9ydCIsIm5ld0ltcG9ydHMiLCJ0cmltIiwicmVwbGFjZVRleHQiLCJtYXliZUNvbW1hIiwiY29tbWEiLCJjbG9zaW5nQnJhY2UiLCJyZW1vdmVSYW5nZSIsInJhbmdlIiwiaW5zZXJ0VGV4dEFmdGVyIl0sIm1hcHBpbmdzIjoiYUFBQTs7QUFFQSxxQzs7QUFFQSxTQUFTQSxPQUFULENBQWlCQyxLQUFqQixFQUF3QjtBQUN0QixTQUFPQSxNQUFNQyxJQUFOLEtBQWUsWUFBZixJQUErQkQsTUFBTUUsS0FBTixLQUFnQixHQUF0RDtBQUNEOztBQUVELFNBQVNDLGdCQUFULENBQTBCQyxLQUExQixFQUFpQ0MsS0FBakMsRUFBd0NDLFVBQXhDLEVBQW9EQyxVQUFwRCxFQUFnRTtBQUM5RCx5QkFBd0JBLFVBQXhCLDhIQUFvQyxLQUF6QkMsU0FBeUI7QUFDbEM7QUFDQSxVQUFNUixRQUFRTSxXQUFXRyxhQUFYLENBQXlCRCxTQUF6QixDQUFkO0FBQ0EsVUFBSVIsU0FBU0QsUUFBUUMsS0FBUixDQUFiLEVBQTZCO0FBQzNCSSxjQUFNTSxJQUFOLENBQVdMLE1BQU1NLE1BQU4sQ0FBYVgsS0FBYixDQUFYO0FBQ0Q7QUFDREksWUFBTU0sSUFBTixDQUFXTCxNQUFNTSxNQUFOLENBQWFILFNBQWIsQ0FBWDtBQUNELEtBUjZEO0FBUy9EOztBQUVELFNBQVNJLGFBQVQ7QUFDRUMsSUFERjtBQUVFUCxVQUZGO0FBR0VDLFVBSEY7QUFJRU8sSUFKRjtBQUtFO0FBQ0EsTUFBTUMsZUFBZVQsV0FBV1UsT0FBWCxDQUFtQkgsS0FBS0ksTUFBeEIsQ0FBckI7QUFDQSxNQUFJVixXQUFXVyxNQUFYLEtBQXNCLENBQTFCLEVBQTZCO0FBQzNCLFdBQU8sRUFBUDtBQUNEOztBQUVELE1BQU1DLFFBQVFaLFdBQVdhLEdBQVgsQ0FBZSxVQUFDQyxDQUFELEVBQU87QUFDbEMsUUFBSUEsRUFBRUMsUUFBRixDQUFXQyxJQUFYLEtBQW9CRixFQUFFRyxLQUFGLENBQVFELElBQWhDLEVBQXNDO0FBQ3BDLGFBQU9GLEVBQUVDLFFBQUYsQ0FBV0MsSUFBbEI7QUFDRDtBQUNELGtCQUFVRixFQUFFQyxRQUFGLENBQVdDLElBQXJCLG9CQUFnQ0YsRUFBRUcsS0FBRixDQUFRRCxJQUF4QztBQUNELEdBTGEsQ0FBZDtBQU1BO0FBQ0EsNEJBQWlCVCxJQUFqQixrQkFBMEJLLE1BQU1NLElBQU4sQ0FBVyxJQUFYLENBQTFCLHVCQUFvRFYsWUFBcEQ7QUFDRDs7QUFFRFcsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0ozQixVQUFNLFlBREY7QUFFSjRCLFVBQU07QUFDSkMsZ0JBQVUsYUFETjtBQUVKQyxtQkFBYSx1RUFGVDtBQUdKQyxXQUFLLDBCQUFRLGlDQUFSLENBSEQsRUFGRjs7QUFPSkMsYUFBUyxNQVBMO0FBUUpDLFlBQVE7QUFDTjtBQUNFakMsWUFBTSxRQURSO0FBRUUsY0FBTSxDQUFDLGVBQUQsRUFBa0Isa0JBQWxCLENBRlI7QUFHRSxpQkFBUyxlQUhYLEVBRE0sQ0FSSixFQURTOzs7OztBQWtCZmtDLFFBbEJlLCtCQWtCUkMsT0FsQlEsRUFrQkM7QUFDZCxVQUFNOUIsYUFBYSxrQ0FBYzhCLE9BQWQsQ0FBbkI7O0FBRUEsVUFBSUEsUUFBUUMsT0FBUixDQUFnQixDQUFoQixNQUF1QixlQUEzQixFQUE0QztBQUMxQyxlQUFPO0FBQ0xDLDJCQURLLDBDQUNhekIsSUFEYixFQUNtQjtBQUN0QixrQkFBSUEsS0FBSzBCLFVBQUwsS0FBb0IsT0FBcEIsSUFBK0IxQixLQUFLMEIsVUFBTCxJQUFtQixJQUF0RCxFQUE0RDtBQUMxRDtBQUNBO0FBQ0Q7O0FBRUQ7QUFDRTtBQUNBMUIsbUJBQUtOLFVBQUwsQ0FBZ0JXLE1BQWhCLEtBQTJCLENBQTNCO0FBQ0dMLG1CQUFLTixVQUFMLENBQWdCVyxNQUFoQixLQUEyQjtBQUM5QjtBQURHO0FBR0RMLG1CQUFLTixVQUFMLENBQWdCLENBQWhCLEVBQW1CTixJQUFuQixLQUE0QjtBQUM1QjtBQURBLGlCQUVHWSxLQUFLTixVQUFMLENBQWdCLENBQWhCLEVBQW1CTixJQUFuQixLQUE0QiwwQkFMOUIsQ0FITDs7QUFVRTtBQUNBO0FBQ0Q7O0FBRURtQyxzQkFBUUksTUFBUixDQUFlO0FBQ2IzQiwwQkFEYTtBQUViNEIseUJBQVMsc0ZBRkk7QUFHYkMsc0JBQU07QUFDSjVCLHdCQUFNRCxLQUFLMEIsVUFEUCxFQUhPOztBQU1iSSxtQkFOYSw0QkFNVHRDLEtBTlMsRUFNRjtBQUNULHdCQUFNdUMsWUFBWXRDLFdBQVd1QyxhQUFYLENBQXlCaEMsSUFBekIsRUFBK0IsRUFBRWlDLE1BQU0sQ0FBUixFQUEvQixDQUFsQjs7QUFFQSwyQkFBTyxHQUFHQyxNQUFIO0FBQ0xILGdDQUFZdkMsTUFBTU0sTUFBTixDQUFhaUMsU0FBYixDQUFaLEdBQXNDLEVBRGpDO0FBRUwvQix5QkFBS04sVUFBTCxDQUFnQmEsR0FBaEIsQ0FBb0IsVUFBQ1osU0FBRCxVQUFlSCxNQUFNMkMsZ0JBQU4sQ0FBdUJ4QyxTQUF2QixTQUFxQ0ssS0FBSzBCLFVBQTFDLFFBQWYsRUFBcEIsQ0FGSyxDQUFQOztBQUlELG1CQWJZLGdCQUFmOztBQWVELGFBcENJLDhCQUFQOztBQXNDRDs7QUFFRDtBQUNBLGFBQU87QUFDTEQseUJBREssMENBQ2F6QixJQURiLEVBQ21CO0FBQ3RCO0FBQ0U7QUFDQUEsaUJBQUswQixVQUFMLEtBQW9CLE1BQXBCO0FBQ0cxQixpQkFBSzBCLFVBQUwsS0FBb0I7QUFDdkI7QUFGQSxlQUdHMUIsS0FBS04sVUFBTCxDQUFnQlcsTUFBaEIsS0FBMkIsQ0FIOUI7QUFJR0wsaUJBQUtOLFVBQUwsQ0FBZ0JXLE1BQWhCLEtBQTJCO0FBQzlCO0FBREc7QUFHREwsaUJBQUtOLFVBQUwsQ0FBZ0IsQ0FBaEIsRUFBbUJOLElBQW5CLEtBQTRCO0FBQzVCO0FBREEsZUFFR1ksS0FBS04sVUFBTCxDQUFnQixDQUFoQixFQUFtQk4sSUFBbkIsS0FBNEIsMEJBTDlCLENBTkw7O0FBYUU7QUFDQTtBQUNEOztBQUVELGdCQUFNZ0QsaUJBQWlCLEVBQXZCO0FBQ0EsZ0JBQU1DLG1CQUFtQixFQUF6QjtBQUNBLGdCQUFNQyxrQkFBa0IsRUFBeEI7QUFDQSxnQkFBSUMsbUJBQW1CLElBQXZCLENBckJzQjtBQXNCdEIsb0NBQXdCdkMsS0FBS04sVUFBN0IsbUlBQXlDLEtBQTlCQyxTQUE4QjtBQUN2QyxvQkFBSUEsVUFBVVAsSUFBVixLQUFtQix3QkFBdkIsRUFBaUQ7QUFDL0NtRCxxQ0FBbUI1QyxTQUFuQjtBQUNBO0FBQ0Q7O0FBRUQsb0JBQUlBLFVBQVUrQixVQUFWLEtBQXlCLE1BQTdCLEVBQXFDO0FBQ25DVSxpQ0FBZXZDLElBQWYsQ0FBb0JGLFNBQXBCO0FBQ0QsaUJBRkQsTUFFTyxJQUFJQSxVQUFVK0IsVUFBVixLQUF5QixRQUE3QixFQUF1QztBQUM1Q1csbUNBQWlCeEMsSUFBakIsQ0FBc0JGLFNBQXRCO0FBQ0QsaUJBRk0sTUFFQSxJQUFJQSxVQUFVK0IsVUFBVixLQUF5QixPQUF6QixJQUFvQy9CLFVBQVUrQixVQUFWLElBQXdCLElBQWhFLEVBQXNFO0FBQzNFWSxrQ0FBZ0J6QyxJQUFoQixDQUFxQkYsU0FBckI7QUFDRDtBQUNGLGVBbkNxQjs7QUFxQ3RCLGdCQUFNNkMsYUFBYXpDLGNBQWNDLElBQWQsRUFBb0JQLFVBQXBCLEVBQWdDMkMsY0FBaEMsRUFBZ0QsTUFBaEQsQ0FBbkI7QUFDQSxnQkFBTUssZUFBZTFDLGNBQWNDLElBQWQsRUFBb0JQLFVBQXBCLEVBQWdDNEMsZ0JBQWhDLEVBQWtELFFBQWxELENBQXJCO0FBQ0EsZ0JBQU1LLGFBQWEsUUFBR0YsVUFBSCxrQkFBa0JDLFlBQWxCLEdBQWlDRSxJQUFqQyxFQUFuQjs7QUFFQSxnQkFBSVAsZUFBZS9CLE1BQWYsR0FBd0JnQyxpQkFBaUJoQyxNQUF6QyxLQUFvREwsS0FBS04sVUFBTCxDQUFnQlcsTUFBeEUsRUFBZ0Y7QUFDOUU7QUFDQSxrQkFBTUosT0FBTyxHQUFHaUMsTUFBSDtBQUNYRSw2QkFBZS9CLE1BQWYsR0FBd0IsQ0FBeEIsR0FBNEIsTUFBNUIsR0FBcUMsRUFEMUI7QUFFWGdDLCtCQUFpQmhDLE1BQWpCLEdBQTBCLENBQTFCLEdBQThCLFFBQTlCLEdBQXlDLEVBRjlCLENBQWI7OztBQUtBa0Isc0JBQVFJLE1BQVIsQ0FBZTtBQUNiM0IsMEJBRGE7QUFFYjRCLHlCQUFTLHNGQUZJO0FBR2JDLHNCQUFNO0FBQ0o1Qix3QkFBTUEsS0FBS1csSUFBTCxDQUFVLEdBQVYsQ0FERixFQUhPOztBQU1ia0IsbUJBTmEsNEJBTVR0QyxLQU5TLEVBTUY7QUFDVCwyQkFBT0EsTUFBTW9ELFdBQU4sQ0FBa0I1QyxJQUFsQixFQUF3QjBDLFVBQXhCLENBQVA7QUFDRCxtQkFSWSxnQkFBZjs7QUFVRCxhQWpCRCxNQWlCTztBQUNMO0FBREssd0hBRUwsc0JBQXdCTixlQUFlRixNQUFmLENBQXNCRyxnQkFBdEIsQ0FBeEIsbUlBQWlFLEtBQXREMUMsVUFBc0Q7QUFDL0Q0QiwwQkFBUUksTUFBUixDQUFlO0FBQ2IzQiwwQkFBTUwsVUFETztBQUViaUMsNkJBQVMsc0ZBRkk7QUFHYkMsMEJBQU07QUFDSjVCLDRCQUFNTixXQUFVK0IsVUFEWixFQUhPOztBQU1iSSx1QkFOYSw0QkFNVHRDLEtBTlMsRUFNRjtBQUNULDRCQUFNRCxRQUFRLEVBQWQ7O0FBRUE7O0FBRUEsNEJBQUkrQyxnQkFBZ0JqQyxNQUFoQixHQUF5QixDQUE3QixFQUFnQztBQUM5Qjs7QUFFQTtBQUNBZiwyQ0FBaUJDLEtBQWpCLEVBQXdCQyxLQUF4QixFQUErQkMsVUFBL0IsRUFBMkMyQyxjQUEzQztBQUNBOUMsMkNBQWlCQyxLQUFqQixFQUF3QkMsS0FBeEIsRUFBK0JDLFVBQS9CLEVBQTJDNEMsZ0JBQTNDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQU1RLGFBQWFwRCxXQUFXRyxhQUFYLENBQXlCMEMsZ0JBQWdCQSxnQkFBZ0JqQyxNQUFoQixHQUF5QixDQUF6QyxDQUF6QixDQUFuQjtBQUNBLDhCQUFJbkIsUUFBUTJELFVBQVIsQ0FBSixFQUF5QjtBQUN2QnRELGtDQUFNTSxJQUFOLENBQVdMLE1BQU1NLE1BQU4sQ0FBYStDLFVBQWIsQ0FBWDtBQUNEO0FBQ0YseUJBbEJELE1Ba0JPLElBQUlOLGdCQUFKLEVBQXNCO0FBQzNCOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDhCQUFNTyxRQUFRckQsV0FBV0csYUFBWCxDQUF5QjJDLGdCQUF6QixFQUEyQ3JELE9BQTNDLENBQWQ7QUFDQSw4QkFBTTZELGVBQWV0RCxXQUFXRyxhQUFYO0FBQ25CSSwrQkFBS04sVUFBTCxDQUFnQk0sS0FBS04sVUFBTCxDQUFnQlcsTUFBaEIsR0FBeUIsQ0FBekMsQ0FEbUI7QUFFbkIsb0NBQUNsQixLQUFELFVBQVdBLE1BQU1DLElBQU4sS0FBZSxZQUFmLElBQStCRCxNQUFNRSxLQUFOLEtBQWdCLEdBQTFELEVBRm1CLENBQXJCOztBQUlBRSxnQ0FBTU0sSUFBTixDQUFXTCxNQUFNd0QsV0FBTixDQUFrQjtBQUMzQkYsZ0NBQU1HLEtBQU4sQ0FBWSxDQUFaLENBRDJCO0FBRTNCRix1Q0FBYUUsS0FBYixDQUFtQixDQUFuQixDQUYyQixDQUFsQixDQUFYOztBQUlEOztBQUVELCtCQUFPMUQsTUFBTTJDLE1BQU47QUFDTDtBQUNBMUMsOEJBQU0wRCxlQUFOLENBQXNCbEQsSUFBdEIsZ0JBQWlDMEMsVUFBakMsRUFGSyxDQUFQOztBQUlELHVCQWxEWSxnQkFBZjs7QUFvREQsaUJBdkRJO0FBd0ROO0FBQ0YsV0FwSEksOEJBQVA7O0FBc0hELEtBckxjLG1CQUFqQiIsImZpbGUiOiJjb25zaXN0ZW50LXR5cGUtc3BlY2lmaWVyLXN0eWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0U291cmNlQ29kZSB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvY29udGV4dENvbXBhdCc7XG5cbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xuXG5mdW5jdGlvbiBpc0NvbW1hKHRva2VuKSB7XG4gIHJldHVybiB0b2tlbi50eXBlID09PSAnUHVuY3R1YXRvcicgJiYgdG9rZW4udmFsdWUgPT09ICcsJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3BlY2lmaWVycyhmaXhlcywgZml4ZXIsIHNvdXJjZUNvZGUsIHNwZWNpZmllcnMpIHtcbiAgZm9yIChjb25zdCBzcGVjaWZpZXIgb2Ygc3BlY2lmaWVycykge1xuICAgIC8vIHJlbW92ZSB0aGUgdHJhaWxpbmcgY29tbWFcbiAgICBjb25zdCB0b2tlbiA9IHNvdXJjZUNvZGUuZ2V0VG9rZW5BZnRlcihzcGVjaWZpZXIpO1xuICAgIGlmICh0b2tlbiAmJiBpc0NvbW1hKHRva2VuKSkge1xuICAgICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmUodG9rZW4pKTtcbiAgICB9XG4gICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmUoc3BlY2lmaWVyKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0SW1wb3J0VGV4dChcbiAgbm9kZSxcbiAgc291cmNlQ29kZSxcbiAgc3BlY2lmaWVycyxcbiAga2luZCxcbikge1xuICBjb25zdCBzb3VyY2VTdHJpbmcgPSBzb3VyY2VDb2RlLmdldFRleHQobm9kZS5zb3VyY2UpO1xuICBpZiAoc3BlY2lmaWVycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBjb25zdCBuYW1lcyA9IHNwZWNpZmllcnMubWFwKChzKSA9PiB7XG4gICAgaWYgKHMuaW1wb3J0ZWQubmFtZSA9PT0gcy5sb2NhbC5uYW1lKSB7XG4gICAgICByZXR1cm4gcy5pbXBvcnRlZC5uYW1lO1xuICAgIH1cbiAgICByZXR1cm4gYCR7cy5pbXBvcnRlZC5uYW1lfSBhcyAke3MubG9jYWwubmFtZX1gO1xuICB9KTtcbiAgLy8gaW5zZXJ0IGEgZnJlc2ggdG9wLWxldmVsIGltcG9ydFxuICByZXR1cm4gYGltcG9ydCAke2tpbmR9IHske25hbWVzLmpvaW4oJywgJyl9fSBmcm9tICR7c291cmNlU3RyaW5nfTtgO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0YToge1xuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcbiAgICBkb2NzOiB7XG4gICAgICBjYXRlZ29yeTogJ1N0eWxlIGd1aWRlJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW5mb3JjZSBvciBiYW4gdGhlIHVzZSBvZiBpbmxpbmUgdHlwZS1vbmx5IG1hcmtlcnMgZm9yIG5hbWVkIGltcG9ydHMuJyxcbiAgICAgIHVybDogZG9jc1VybCgnY29uc2lzdGVudC10eXBlLXNwZWNpZmllci1zdHlsZScpLFxuICAgIH0sXG4gICAgZml4YWJsZTogJ2NvZGUnLFxuICAgIHNjaGVtYTogW1xuICAgICAge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZW51bTogWydwcmVmZXItaW5saW5lJywgJ3ByZWZlci10b3AtbGV2ZWwnXSxcbiAgICAgICAgZGVmYXVsdDogJ3ByZWZlci1pbmxpbmUnLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuXG4gIGNyZWF0ZShjb250ZXh0KSB7XG4gICAgY29uc3Qgc291cmNlQ29kZSA9IGdldFNvdXJjZUNvZGUoY29udGV4dCk7XG5cbiAgICBpZiAoY29udGV4dC5vcHRpb25zWzBdID09PSAncHJlZmVyLWlubGluZScpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIEltcG9ydERlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgICBpZiAobm9kZS5pbXBvcnRLaW5kID09PSAndmFsdWUnIHx8IG5vZGUuaW1wb3J0S2luZCA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyB0b3AtbGV2ZWwgdmFsdWUgLyB1bmtub3duIGlzIHZhbGlkXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgLy8gbm8gc3BlY2lmaWVycyAoaW1wb3J0IHR5cGUge30gZnJvbSAnJykgaGF2ZSBubyBzcGVjaWZpZXJzIHRvIG1hcmsgYXMgaW5saW5lXG4gICAgICAgICAgICBub2RlLnNwZWNpZmllcnMubGVuZ3RoID09PSAwXG4gICAgICAgICAgICB8fCBub2RlLnNwZWNpZmllcnMubGVuZ3RoID09PSAxXG4gICAgICAgICAgICAvLyBkZWZhdWx0IGltcG9ydHMgYXJlIGJvdGggXCJpbmxpbmVcIiBhbmQgXCJ0b3AtbGV2ZWxcIlxuICAgICAgICAgICAgJiYgKFxuICAgICAgICAgICAgICBub2RlLnNwZWNpZmllcnNbMF0udHlwZSA9PT0gJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInXG4gICAgICAgICAgICAgIC8vIG5hbWVzcGFjZSBpbXBvcnRzIGFyZSBib3RoIFwiaW5saW5lXCIgYW5kIFwidG9wLWxldmVsXCJcbiAgICAgICAgICAgICAgfHwgbm9kZS5zcGVjaWZpZXJzWzBdLnR5cGUgPT09ICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdQcmVmZXIgdXNpbmcgaW5saW5lIHt7a2luZH19IHNwZWNpZmllcnMgaW5zdGVhZCBvZiBhIHRvcC1sZXZlbCB7e2tpbmR9fS1vbmx5IGltcG9ydC4nLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBraW5kOiBub2RlLmltcG9ydEtpbmQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZml4KGZpeGVyKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGtpbmRUb2tlbiA9IHNvdXJjZUNvZGUuZ2V0Rmlyc3RUb2tlbihub2RlLCB7IHNraXA6IDEgfSk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIFtdLmNvbmNhdChcbiAgICAgICAgICAgICAgICBraW5kVG9rZW4gPyBmaXhlci5yZW1vdmUoa2luZFRva2VuKSA6IFtdLFxuICAgICAgICAgICAgICAgIG5vZGUuc3BlY2lmaWVycy5tYXAoKHNwZWNpZmllcikgPT4gZml4ZXIuaW5zZXJ0VGV4dEJlZm9yZShzcGVjaWZpZXIsIGAke25vZGUuaW1wb3J0S2luZH0gYCkpLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gcHJlZmVyLXRvcC1sZXZlbFxuICAgIHJldHVybiB7XG4gICAgICBJbXBvcnREZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAvLyBhbHJlYWR5IHRvcC1sZXZlbCBpcyB2YWxpZFxuICAgICAgICAgIG5vZGUuaW1wb3J0S2luZCA9PT0gJ3R5cGUnXG4gICAgICAgICAgfHwgbm9kZS5pbXBvcnRLaW5kID09PSAndHlwZW9mJ1xuICAgICAgICAgIC8vIG5vIHNwZWNpZmllcnMgKGltcG9ydCB7fSBmcm9tICcnKSBjYW5ub3QgaGF2ZSBpbmxpbmUgLSBzbyBpcyB2YWxpZFxuICAgICAgICAgIHx8IG5vZGUuc3BlY2lmaWVycy5sZW5ndGggPT09IDBcbiAgICAgICAgICB8fCBub2RlLnNwZWNpZmllcnMubGVuZ3RoID09PSAxXG4gICAgICAgICAgLy8gZGVmYXVsdCBpbXBvcnRzIGFyZSBib3RoIFwiaW5saW5lXCIgYW5kIFwidG9wLWxldmVsXCJcbiAgICAgICAgICAmJiAoXG4gICAgICAgICAgICBub2RlLnNwZWNpZmllcnNbMF0udHlwZSA9PT0gJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInXG4gICAgICAgICAgICAvLyBuYW1lc3BhY2UgaW1wb3J0cyBhcmUgYm90aCBcImlubGluZVwiIGFuZCBcInRvcC1sZXZlbFwiXG4gICAgICAgICAgICB8fCBub2RlLnNwZWNpZmllcnNbMF0udHlwZSA9PT0gJ0ltcG9ydE5hbWVzcGFjZVNwZWNpZmllcidcbiAgICAgICAgICApXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHR5cGVTcGVjaWZpZXJzID0gW107XG4gICAgICAgIGNvbnN0IHR5cGVvZlNwZWNpZmllcnMgPSBbXTtcbiAgICAgICAgY29uc3QgdmFsdWVTcGVjaWZpZXJzID0gW107XG4gICAgICAgIGxldCBkZWZhdWx0U3BlY2lmaWVyID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBzcGVjaWZpZXIgb2Ygbm9kZS5zcGVjaWZpZXJzKSB7XG4gICAgICAgICAgaWYgKHNwZWNpZmllci50eXBlID09PSAnSW1wb3J0RGVmYXVsdFNwZWNpZmllcicpIHtcbiAgICAgICAgICAgIGRlZmF1bHRTcGVjaWZpZXIgPSBzcGVjaWZpZXI7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc3BlY2lmaWVyLmltcG9ydEtpbmQgPT09ICd0eXBlJykge1xuICAgICAgICAgICAgdHlwZVNwZWNpZmllcnMucHVzaChzcGVjaWZpZXIpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3BlY2lmaWVyLmltcG9ydEtpbmQgPT09ICd0eXBlb2YnKSB7XG4gICAgICAgICAgICB0eXBlb2ZTcGVjaWZpZXJzLnB1c2goc3BlY2lmaWVyKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNwZWNpZmllci5pbXBvcnRLaW5kID09PSAndmFsdWUnIHx8IHNwZWNpZmllci5pbXBvcnRLaW5kID09IG51bGwpIHtcbiAgICAgICAgICAgIHZhbHVlU3BlY2lmaWVycy5wdXNoKHNwZWNpZmllcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHlwZUltcG9ydCA9IGdldEltcG9ydFRleHQobm9kZSwgc291cmNlQ29kZSwgdHlwZVNwZWNpZmllcnMsICd0eXBlJyk7XG4gICAgICAgIGNvbnN0IHR5cGVvZkltcG9ydCA9IGdldEltcG9ydFRleHQobm9kZSwgc291cmNlQ29kZSwgdHlwZW9mU3BlY2lmaWVycywgJ3R5cGVvZicpO1xuICAgICAgICBjb25zdCBuZXdJbXBvcnRzID0gYCR7dHlwZUltcG9ydH1cXG4ke3R5cGVvZkltcG9ydH1gLnRyaW0oKTtcblxuICAgICAgICBpZiAodHlwZVNwZWNpZmllcnMubGVuZ3RoICsgdHlwZW9mU3BlY2lmaWVycy5sZW5ndGggPT09IG5vZGUuc3BlY2lmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBhbGwgc3BlY2lmaWVycyBoYXZlIGlubGluZSBzcGVjaWZpZXJzIC0gc28gd2UgcmVwbGFjZSB0aGUgZW50aXJlIGltcG9ydFxuICAgICAgICAgIGNvbnN0IGtpbmQgPSBbXS5jb25jYXQoXG4gICAgICAgICAgICB0eXBlU3BlY2lmaWVycy5sZW5ndGggPiAwID8gJ3R5cGUnIDogW10sXG4gICAgICAgICAgICB0eXBlb2ZTcGVjaWZpZXJzLmxlbmd0aCA+IDAgPyAndHlwZW9mJyA6IFtdLFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1ByZWZlciB1c2luZyBhIHRvcC1sZXZlbCB7e2tpbmR9fS1vbmx5IGltcG9ydCBpbnN0ZWFkIG9mIGlubGluZSB7e2tpbmR9fSBzcGVjaWZpZXJzLicsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIGtpbmQ6IGtpbmQuam9pbignLycpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpeChmaXhlcikge1xuICAgICAgICAgICAgICByZXR1cm4gZml4ZXIucmVwbGFjZVRleHQobm9kZSwgbmV3SW1wb3J0cyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHJlbW92ZSBzcGVjaWZpYyBzcGVjaWZpZXJzIGFuZCBpbnNlcnQgbmV3IGltcG9ydHMgZm9yIHRoZW1cbiAgICAgICAgICBmb3IgKGNvbnN0IHNwZWNpZmllciBvZiB0eXBlU3BlY2lmaWVycy5jb25jYXQodHlwZW9mU3BlY2lmaWVycykpIHtcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgICAgICAgbm9kZTogc3BlY2lmaWVyLFxuICAgICAgICAgICAgICBtZXNzYWdlOiAnUHJlZmVyIHVzaW5nIGEgdG9wLWxldmVsIHt7a2luZH19LW9ubHkgaW1wb3J0IGluc3RlYWQgb2YgaW5saW5lIHt7a2luZH19IHNwZWNpZmllcnMuJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGtpbmQ6IHNwZWNpZmllci5pbXBvcnRLaW5kLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmaXgoZml4ZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaXhlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIHZhbHVlIHNwZWNpZmllcnMsIHRoZW4gdGhlIG90aGVyIHJlcG9ydCBmaXhlciB3aWxsIGJlIGNhbGxlZCwgbm90IHRoaXMgb25lXG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWVTcGVjaWZpZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIC8vIGltcG9ydCB7IFZhbHVlLCB0eXBlIFR5cGUgfSBmcm9tICdtb2QnO1xuXG4gICAgICAgICAgICAgICAgICAvLyB3ZSBjYW4ganVzdCByZW1vdmUgdGhlIHR5cGUgc3BlY2lmaWVyc1xuICAgICAgICAgICAgICAgICAgcmVtb3ZlU3BlY2lmaWVycyhmaXhlcywgZml4ZXIsIHNvdXJjZUNvZGUsIHR5cGVTcGVjaWZpZXJzKTtcbiAgICAgICAgICAgICAgICAgIHJlbW92ZVNwZWNpZmllcnMoZml4ZXMsIGZpeGVyLCBzb3VyY2VDb2RlLCB0eXBlb2ZTcGVjaWZpZXJzKTtcblxuICAgICAgICAgICAgICAgICAgLy8gbWFrZSB0aGUgaW1wb3J0IG5pY2VseSBmb3JtYXR0ZWQgYnkgYWxzbyByZW1vdmluZyB0aGUgdHJhaWxpbmcgY29tbWEgYWZ0ZXIgdGhlIGxhc3QgdmFsdWUgaW1wb3J0XG4gICAgICAgICAgICAgICAgICAvLyBlZ1xuICAgICAgICAgICAgICAgICAgLy8gaW1wb3J0IHsgVmFsdWUsIHR5cGUgVHlwZSB9IGZyb20gJ21vZCc7XG4gICAgICAgICAgICAgICAgICAvLyB0b1xuICAgICAgICAgICAgICAgICAgLy8gaW1wb3J0IHsgVmFsdWUgIH0gZnJvbSAnbW9kJztcbiAgICAgICAgICAgICAgICAgIC8vIG5vdFxuICAgICAgICAgICAgICAgICAgLy8gaW1wb3J0IHsgVmFsdWUsICB9IGZyb20gJ21vZCc7XG4gICAgICAgICAgICAgICAgICBjb25zdCBtYXliZUNvbW1hID0gc291cmNlQ29kZS5nZXRUb2tlbkFmdGVyKHZhbHVlU3BlY2lmaWVyc1t2YWx1ZVNwZWNpZmllcnMubGVuZ3RoIC0gMV0pO1xuICAgICAgICAgICAgICAgICAgaWYgKGlzQ29tbWEobWF5YmVDb21tYSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmUobWF5YmVDb21tYSkpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVmYXVsdFNwZWNpZmllcikge1xuICAgICAgICAgICAgICAgICAgLy8gaW1wb3J0IERlZmF1bHQsIHsgdHlwZSBUeXBlIH0gZnJvbSAnbW9kJztcblxuICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBlbnRpcmUgY3VybHkgYmxvY2sgc28gd2UgZG9uJ3QgbGVhdmUgYW4gZW1wdHkgb25lIGJlaGluZFxuICAgICAgICAgICAgICAgICAgLy8gTk9URSAtIHRoZSBkZWZhdWx0IHNwZWNpZmllciAqbXVzdCogYmUgdGhlIGZpcnN0IHNwZWNpZmllciBhbHdheXMhXG4gICAgICAgICAgICAgICAgICAvLyAgICAgICAgc28gYSBjb21tYSBleGlzdHMgdGhhdCB3ZSBhbHNvIGhhdmUgdG8gY2xlYW4gdXAgb3IgZWxzZSBpdCdzIGJhZCBzeW50YXhcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1hID0gc291cmNlQ29kZS5nZXRUb2tlbkFmdGVyKGRlZmF1bHRTcGVjaWZpZXIsIGlzQ29tbWEpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2xvc2luZ0JyYWNlID0gc291cmNlQ29kZS5nZXRUb2tlbkFmdGVyKFxuICAgICAgICAgICAgICAgICAgICBub2RlLnNwZWNpZmllcnNbbm9kZS5zcGVjaWZpZXJzLmxlbmd0aCAtIDFdLFxuICAgICAgICAgICAgICAgICAgICAodG9rZW4pID0+IHRva2VuLnR5cGUgPT09ICdQdW5jdHVhdG9yJyAmJiB0b2tlbi52YWx1ZSA9PT0gJ30nLFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIGZpeGVzLnB1c2goZml4ZXIucmVtb3ZlUmFuZ2UoW1xuICAgICAgICAgICAgICAgICAgICBjb21tYS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICAgICAgY2xvc2luZ0JyYWNlLnJhbmdlWzFdLFxuICAgICAgICAgICAgICAgICAgXSkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBmaXhlcy5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAvLyBpbnNlcnQgdGhlIG5ldyBpbXBvcnRzIGFmdGVyIHRoZSBvbGQgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICAgIGZpeGVyLmluc2VydFRleHRBZnRlcihub2RlLCBgXFxuJHtuZXdJbXBvcnRzfWApLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn07XG4iXX0=