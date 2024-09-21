'use strict';var _contextCompat = require('eslint-module-utils/contextCompat');

var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Helpful warnings',
      description: 'Forbid the use of mutable exports with `var` or `let`.',
      url: (0, _docsUrl2['default'])('no-mutable-exports') },

    schema: [] },


  create: function () {function create(context) {
      function checkDeclaration(node) {var
        kind = node.kind;
        if (kind === 'var' || kind === 'let') {
          context.report(node, 'Exporting mutable \'' + String(kind) + '\' binding, use \'const\' instead.');
        }
      }

      function checkDeclarationsInScope(_ref, name) {var variables = _ref.variables;var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
          for (var _iterator = variables[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var variable = _step.value;
            if (variable.name === name) {var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
                for (var _iterator2 = variable.defs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var def = _step2.value;
                  if (def.type === 'Variable' && def.parent) {
                    checkDeclaration(def.parent);
                  }
                }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}
            }
          }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
      }

      function handleExportDefault(node) {
        var scope = (0, _contextCompat.getScope)(context, node);

        if (node.declaration.name) {
          checkDeclarationsInScope(scope, node.declaration.name);
        }
      }

      function handleExportNamed(node) {
        var scope = (0, _contextCompat.getScope)(context, node);

        if (node.declaration) {
          checkDeclaration(node.declaration);
        } else if (!node.source) {var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {
            for (var _iterator3 = node.specifiers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var specifier = _step3.value;
              checkDeclarationsInScope(scope, specifier.local.name);
            }} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3['return']) {_iterator3['return']();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}
        }
      }

      return {
        ExportDefaultDeclaration: handleExportDefault,
        ExportNamedDeclaration: handleExportNamed };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1tdXRhYmxlLWV4cG9ydHMuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsImNhdGVnb3J5IiwiZGVzY3JpcHRpb24iLCJ1cmwiLCJzY2hlbWEiLCJjcmVhdGUiLCJjb250ZXh0IiwiY2hlY2tEZWNsYXJhdGlvbiIsIm5vZGUiLCJraW5kIiwicmVwb3J0IiwiY2hlY2tEZWNsYXJhdGlvbnNJblNjb3BlIiwibmFtZSIsInZhcmlhYmxlcyIsInZhcmlhYmxlIiwiZGVmcyIsImRlZiIsInBhcmVudCIsImhhbmRsZUV4cG9ydERlZmF1bHQiLCJzY29wZSIsImRlY2xhcmF0aW9uIiwiaGFuZGxlRXhwb3J0TmFtZWQiLCJzb3VyY2UiLCJzcGVjaWZpZXJzIiwic3BlY2lmaWVyIiwibG9jYWwiLCJFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24iLCJFeHBvcnROYW1lZERlY2xhcmF0aW9uIl0sIm1hcHBpbmdzIjoiYUFBQTs7QUFFQSxxQzs7QUFFQUEsT0FBT0MsT0FBUCxHQUFpQjtBQUNmQyxRQUFNO0FBQ0pDLFVBQU0sWUFERjtBQUVKQyxVQUFNO0FBQ0pDLGdCQUFVLGtCQUROO0FBRUpDLG1CQUFhLHdEQUZUO0FBR0pDLFdBQUssMEJBQVEsb0JBQVIsQ0FIRCxFQUZGOztBQU9KQyxZQUFRLEVBUEosRUFEUzs7O0FBV2ZDLFFBWGUsK0JBV1JDLE9BWFEsRUFXQztBQUNkLGVBQVNDLGdCQUFULENBQTBCQyxJQUExQixFQUFnQztBQUN0QkMsWUFEc0IsR0FDYkQsSUFEYSxDQUN0QkMsSUFEc0I7QUFFOUIsWUFBSUEsU0FBUyxLQUFULElBQWtCQSxTQUFTLEtBQS9CLEVBQXNDO0FBQ3BDSCxrQkFBUUksTUFBUixDQUFlRixJQUFmLGtDQUEyQ0MsSUFBM0M7QUFDRDtBQUNGOztBQUVELGVBQVNFLHdCQUFULE9BQWlEQyxJQUFqRCxFQUF1RCxLQUFuQkMsU0FBbUIsUUFBbkJBLFNBQW1CO0FBQ3JELCtCQUF1QkEsU0FBdkIsOEhBQWtDLEtBQXZCQyxRQUF1QjtBQUNoQyxnQkFBSUEsU0FBU0YsSUFBVCxLQUFrQkEsSUFBdEIsRUFBNEI7QUFDMUIsc0NBQWtCRSxTQUFTQyxJQUEzQixtSUFBaUMsS0FBdEJDLEdBQXNCO0FBQy9CLHNCQUFJQSxJQUFJakIsSUFBSixLQUFhLFVBQWIsSUFBMkJpQixJQUFJQyxNQUFuQyxFQUEyQztBQUN6Q1YscUNBQWlCUyxJQUFJQyxNQUFyQjtBQUNEO0FBQ0YsaUJBTHlCO0FBTTNCO0FBQ0YsV0FUb0Q7QUFVdEQ7O0FBRUQsZUFBU0MsbUJBQVQsQ0FBNkJWLElBQTdCLEVBQW1DO0FBQ2pDLFlBQU1XLFFBQVEsNkJBQVNiLE9BQVQsRUFBa0JFLElBQWxCLENBQWQ7O0FBRUEsWUFBSUEsS0FBS1ksV0FBTCxDQUFpQlIsSUFBckIsRUFBMkI7QUFDekJELG1DQUF5QlEsS0FBekIsRUFBZ0NYLEtBQUtZLFdBQUwsQ0FBaUJSLElBQWpEO0FBQ0Q7QUFDRjs7QUFFRCxlQUFTUyxpQkFBVCxDQUEyQmIsSUFBM0IsRUFBaUM7QUFDL0IsWUFBTVcsUUFBUSw2QkFBU2IsT0FBVCxFQUFrQkUsSUFBbEIsQ0FBZDs7QUFFQSxZQUFJQSxLQUFLWSxXQUFULEVBQXVCO0FBQ3JCYiwyQkFBaUJDLEtBQUtZLFdBQXRCO0FBQ0QsU0FGRCxNQUVPLElBQUksQ0FBQ1osS0FBS2MsTUFBVixFQUFrQjtBQUN2QixrQ0FBd0JkLEtBQUtlLFVBQTdCLG1JQUF5QyxLQUE5QkMsU0FBOEI7QUFDdkNiLHVDQUF5QlEsS0FBekIsRUFBZ0NLLFVBQVVDLEtBQVYsQ0FBZ0JiLElBQWhEO0FBQ0QsYUFIc0I7QUFJeEI7QUFDRjs7QUFFRCxhQUFPO0FBQ0xjLGtDQUEwQlIsbUJBRHJCO0FBRUxTLGdDQUF3Qk4saUJBRm5CLEVBQVA7O0FBSUQsS0F2RGMsbUJBQWpCIiwiZmlsZSI6Im5vLW11dGFibGUtZXhwb3J0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldFNjb3BlIH0gZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9jb250ZXh0Q29tcGF0JztcblxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxuICAgIGRvY3M6IHtcbiAgICAgIGNhdGVnb3J5OiAnSGVscGZ1bCB3YXJuaW5ncycsXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZvcmJpZCB0aGUgdXNlIG9mIG11dGFibGUgZXhwb3J0cyB3aXRoIGB2YXJgIG9yIGBsZXRgLicsXG4gICAgICB1cmw6IGRvY3NVcmwoJ25vLW11dGFibGUtZXhwb3J0cycpLFxuICAgIH0sXG4gICAgc2NoZW1hOiBbXSxcbiAgfSxcblxuICBjcmVhdGUoY29udGV4dCkge1xuICAgIGZ1bmN0aW9uIGNoZWNrRGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgY29uc3QgeyBraW5kIH0gPSBub2RlO1xuICAgICAgaWYgKGtpbmQgPT09ICd2YXInIHx8IGtpbmQgPT09ICdsZXQnKSB7XG4gICAgICAgIGNvbnRleHQucmVwb3J0KG5vZGUsIGBFeHBvcnRpbmcgbXV0YWJsZSAnJHtraW5kfScgYmluZGluZywgdXNlICdjb25zdCcgaW5zdGVhZC5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja0RlY2xhcmF0aW9uc0luU2NvcGUoeyB2YXJpYWJsZXMgfSwgbmFtZSkge1xuICAgICAgZm9yIChjb25zdCB2YXJpYWJsZSBvZiB2YXJpYWJsZXMpIHtcbiAgICAgICAgaWYgKHZhcmlhYmxlLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGRlZiBvZiB2YXJpYWJsZS5kZWZzKSB7XG4gICAgICAgICAgICBpZiAoZGVmLnR5cGUgPT09ICdWYXJpYWJsZScgJiYgZGVmLnBhcmVudCkge1xuICAgICAgICAgICAgICBjaGVja0RlY2xhcmF0aW9uKGRlZi5wYXJlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUV4cG9ydERlZmF1bHQobm9kZSkge1xuICAgICAgY29uc3Qgc2NvcGUgPSBnZXRTY29wZShjb250ZXh0LCBub2RlKTtcblxuICAgICAgaWYgKG5vZGUuZGVjbGFyYXRpb24ubmFtZSkge1xuICAgICAgICBjaGVja0RlY2xhcmF0aW9uc0luU2NvcGUoc2NvcGUsIG5vZGUuZGVjbGFyYXRpb24ubmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlRXhwb3J0TmFtZWQobm9kZSkge1xuICAgICAgY29uc3Qgc2NvcGUgPSBnZXRTY29wZShjb250ZXh0LCBub2RlKTtcblxuICAgICAgaWYgKG5vZGUuZGVjbGFyYXRpb24pICB7XG4gICAgICAgIGNoZWNrRGVjbGFyYXRpb24obm9kZS5kZWNsYXJhdGlvbik7XG4gICAgICB9IGVsc2UgaWYgKCFub2RlLnNvdXJjZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHNwZWNpZmllciBvZiBub2RlLnNwZWNpZmllcnMpIHtcbiAgICAgICAgICBjaGVja0RlY2xhcmF0aW9uc0luU2NvcGUoc2NvcGUsIHNwZWNpZmllci5sb2NhbC5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBFeHBvcnREZWZhdWx0RGVjbGFyYXRpb246IGhhbmRsZUV4cG9ydERlZmF1bHQsXG4gICAgICBFeHBvcnROYW1lZERlY2xhcmF0aW9uOiBoYW5kbGVFeHBvcnROYW1lZCxcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==