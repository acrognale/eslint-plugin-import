'use strict';var _contextCompat = require('eslint-module-utils/contextCompat');

var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Style guide',
      description: 'Forbid default exports.',
      url: (0, _docsUrl2['default'])('no-default-export') },

    schema: [] },


  create: function () {function create(context) {
      // ignore non-modules
      if (context.parserOptions.sourceType !== 'module') {
        return {};
      }

      var preferNamed = 'Prefer named exports.';
      var noAliasDefault = function () {function noAliasDefault(_ref) {var local = _ref.local;return 'Do not alias `' + String(local.name) + '` as `default`. Just export `' + String(local.name) + '` itself instead.';}return noAliasDefault;}();

      return {
        ExportDefaultDeclaration: function () {function ExportDefaultDeclaration(node) {var _ref2 =
            (0, _contextCompat.getSourceCode)(context).getFirstTokens(node)[1] || {},loc = _ref2.loc;
            context.report({ node: node, message: preferNamed, loc: loc });
          }return ExportDefaultDeclaration;}(),

        ExportNamedDeclaration: function () {function ExportNamedDeclaration(node) {
            node.specifiers.
            filter(function (specifier) {return (specifier.exported.name || specifier.exported.value) === 'default';}).
            forEach(function (specifier) {var _ref3 =
              (0, _contextCompat.getSourceCode)(context).getFirstTokens(node)[1] || {},loc = _ref3.loc;
              if (specifier.type === 'ExportDefaultSpecifier') {
                context.report({ node: node, message: preferNamed, loc: loc });
              } else if (specifier.type === 'ExportSpecifier') {
                context.report({ node: node, message: noAliasDefault(specifier), loc: loc });
              }
            });
          }return ExportNamedDeclaration;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1kZWZhdWx0LWV4cG9ydC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsInR5cGUiLCJkb2NzIiwiY2F0ZWdvcnkiLCJkZXNjcmlwdGlvbiIsInVybCIsInNjaGVtYSIsImNyZWF0ZSIsImNvbnRleHQiLCJwYXJzZXJPcHRpb25zIiwic291cmNlVHlwZSIsInByZWZlck5hbWVkIiwibm9BbGlhc0RlZmF1bHQiLCJsb2NhbCIsIm5hbWUiLCJFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24iLCJub2RlIiwiZ2V0Rmlyc3RUb2tlbnMiLCJsb2MiLCJyZXBvcnQiLCJtZXNzYWdlIiwiRXhwb3J0TmFtZWREZWNsYXJhdGlvbiIsInNwZWNpZmllcnMiLCJmaWx0ZXIiLCJzcGVjaWZpZXIiLCJleHBvcnRlZCIsInZhbHVlIiwiZm9yRWFjaCJdLCJtYXBwaW5ncyI6ImFBQUE7O0FBRUEscUM7O0FBRUFBLE9BQU9DLE9BQVAsR0FBaUI7QUFDZkMsUUFBTTtBQUNKQyxVQUFNLFlBREY7QUFFSkMsVUFBTTtBQUNKQyxnQkFBVSxhQUROO0FBRUpDLG1CQUFhLHlCQUZUO0FBR0pDLFdBQUssMEJBQVEsbUJBQVIsQ0FIRCxFQUZGOztBQU9KQyxZQUFRLEVBUEosRUFEUzs7O0FBV2ZDLFFBWGUsK0JBV1JDLE9BWFEsRUFXQztBQUNkO0FBQ0EsVUFBSUEsUUFBUUMsYUFBUixDQUFzQkMsVUFBdEIsS0FBcUMsUUFBekMsRUFBbUQ7QUFDakQsZUFBTyxFQUFQO0FBQ0Q7O0FBRUQsVUFBTUMsY0FBYyx1QkFBcEI7QUFDQSxVQUFNQyw4QkFBaUIsU0FBakJBLGNBQWlCLFlBQUdDLEtBQUgsUUFBR0EsS0FBSCxrQ0FBaUNBLE1BQU1DLElBQXZDLDZDQUErRUQsTUFBTUMsSUFBckYseUJBQWpCLHlCQUFOOztBQUVBLGFBQU87QUFDTEMsZ0NBREssaURBQ29CQyxJQURwQixFQUMwQjtBQUNiLDhDQUFjUixPQUFkLEVBQXVCUyxjQUF2QixDQUFzQ0QsSUFBdEMsRUFBNEMsQ0FBNUMsS0FBa0QsRUFEckMsQ0FDckJFLEdBRHFCLFNBQ3JCQSxHQURxQjtBQUU3QlYsb0JBQVFXLE1BQVIsQ0FBZSxFQUFFSCxVQUFGLEVBQVFJLFNBQVNULFdBQWpCLEVBQThCTyxRQUE5QixFQUFmO0FBQ0QsV0FKSTs7QUFNTEcsOEJBTkssK0NBTWtCTCxJQU5sQixFQU13QjtBQUMzQkEsaUJBQUtNLFVBQUw7QUFDR0Msa0JBREgsQ0FDVSxVQUFDQyxTQUFELFVBQWUsQ0FBQ0EsVUFBVUMsUUFBVixDQUFtQlgsSUFBbkIsSUFBMkJVLFVBQVVDLFFBQVYsQ0FBbUJDLEtBQS9DLE1BQTBELFNBQXpFLEVBRFY7QUFFR0MsbUJBRkgsQ0FFVyxVQUFDSCxTQUFELEVBQWU7QUFDTixnREFBY2hCLE9BQWQsRUFBdUJTLGNBQXZCLENBQXNDRCxJQUF0QyxFQUE0QyxDQUE1QyxLQUFrRCxFQUQ1QyxDQUNkRSxHQURjLFNBQ2RBLEdBRGM7QUFFdEIsa0JBQUlNLFVBQVV2QixJQUFWLEtBQW1CLHdCQUF2QixFQUFpRDtBQUMvQ08sd0JBQVFXLE1BQVIsQ0FBZSxFQUFFSCxVQUFGLEVBQVFJLFNBQVNULFdBQWpCLEVBQThCTyxRQUE5QixFQUFmO0FBQ0QsZUFGRCxNQUVPLElBQUlNLFVBQVV2QixJQUFWLEtBQW1CLGlCQUF2QixFQUEwQztBQUMvQ08sd0JBQVFXLE1BQVIsQ0FBZSxFQUFFSCxVQUFGLEVBQVFJLFNBQVNSLGVBQWVZLFNBQWYsQ0FBakIsRUFBNENOLFFBQTVDLEVBQWY7QUFDRDtBQUNGLGFBVEg7QUFVRCxXQWpCSSxtQ0FBUDs7QUFtQkQsS0F2Q2MsbUJBQWpCIiwiZmlsZSI6Im5vLWRlZmF1bHQtZXhwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0U291cmNlQ29kZSB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvY29udGV4dENvbXBhdCc7XG5cbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0YToge1xuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcbiAgICBkb2NzOiB7XG4gICAgICBjYXRlZ29yeTogJ1N0eWxlIGd1aWRlJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIGRlZmF1bHQgZXhwb3J0cy4nLFxuICAgICAgdXJsOiBkb2NzVXJsKCduby1kZWZhdWx0LWV4cG9ydCcpLFxuICAgIH0sXG4gICAgc2NoZW1hOiBbXSxcbiAgfSxcblxuICBjcmVhdGUoY29udGV4dCkge1xuICAgIC8vIGlnbm9yZSBub24tbW9kdWxlc1xuICAgIGlmIChjb250ZXh0LnBhcnNlck9wdGlvbnMuc291cmNlVHlwZSAhPT0gJ21vZHVsZScpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBjb25zdCBwcmVmZXJOYW1lZCA9ICdQcmVmZXIgbmFtZWQgZXhwb3J0cy4nO1xuICAgIGNvbnN0IG5vQWxpYXNEZWZhdWx0ID0gKHsgbG9jYWwgfSkgPT4gYERvIG5vdCBhbGlhcyBcXGAke2xvY2FsLm5hbWV9XFxgIGFzIFxcYGRlZmF1bHRcXGAuIEp1c3QgZXhwb3J0IFxcYCR7bG9jYWwubmFtZX1cXGAgaXRzZWxmIGluc3RlYWQuYDtcblxuICAgIHJldHVybiB7XG4gICAgICBFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgICBjb25zdCB7IGxvYyB9ID0gZ2V0U291cmNlQ29kZShjb250ZXh0KS5nZXRGaXJzdFRva2Vucyhub2RlKVsxXSB8fCB7fTtcbiAgICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlLCBtZXNzYWdlOiBwcmVmZXJOYW1lZCwgbG9jIH0pO1xuICAgICAgfSxcblxuICAgICAgRXhwb3J0TmFtZWREZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIG5vZGUuc3BlY2lmaWVyc1xuICAgICAgICAgIC5maWx0ZXIoKHNwZWNpZmllcikgPT4gKHNwZWNpZmllci5leHBvcnRlZC5uYW1lIHx8IHNwZWNpZmllci5leHBvcnRlZC52YWx1ZSkgPT09ICdkZWZhdWx0JylcbiAgICAgICAgICAuZm9yRWFjaCgoc3BlY2lmaWVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGxvYyB9ID0gZ2V0U291cmNlQ29kZShjb250ZXh0KS5nZXRGaXJzdFRva2Vucyhub2RlKVsxXSB8fCB7fTtcbiAgICAgICAgICAgIGlmIChzcGVjaWZpZXIudHlwZSA9PT0gJ0V4cG9ydERlZmF1bHRTcGVjaWZpZXInKSB7XG4gICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHsgbm9kZSwgbWVzc2FnZTogcHJlZmVyTmFtZWQsIGxvYyB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3BlY2lmaWVyLnR5cGUgPT09ICdFeHBvcnRTcGVjaWZpZXInKSB7XG4gICAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHsgbm9kZSwgbWVzc2FnZTogbm9BbGlhc0RlZmF1bHQoc3BlY2lmaWVyKSwgbG9jICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn07XG4iXX0=