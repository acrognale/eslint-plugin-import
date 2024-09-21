'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @fileOverview Ensures that no imported module imports the linted module.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * @author Ben Mosher
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */

var _contextCompat = require('eslint-module-utils/contextCompat');
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);

var _builder = require('../exportMap/builder');var _builder2 = _interopRequireDefault(_builder);
var _scc = require('../scc');var _scc2 = _interopRequireDefault(_scc);
var _importType = require('../core/importType');
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}

var traversed = new Set();

function routeString(route) {
  return route.map(function (s) {return String(s.value) + ':' + String(s.loc.start.line);}).join('=>');
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Static analysis',
      description: 'Forbid a module from importing a module with a dependency path back to itself.',
      url: (0, _docsUrl2['default'])('no-cycle') },

    schema: [(0, _moduleVisitor.makeOptionsSchema)({
      maxDepth: {
        anyOf: [
        {
          description: 'maximum dependency depth to traverse',
          type: 'integer',
          minimum: 1 },

        {
          'enum': ['∞'],
          type: 'string' }] },



      ignoreExternal: {
        description: 'ignore external modules',
        type: 'boolean',
        'default': false },

      allowUnsafeDynamicCyclicDependency: {
        description: 'Allow cyclic dependency if there is at least one dynamic import in the chain',
        type: 'boolean',
        'default': false },

      disableScc: {
        description: 'When true, don\'t calculate a strongly-connected-components graph. SCC is used to reduce the time-complexity of cycle detection, but adds overhead.',
        type: 'boolean',
        'default': false } })] },




  create: function () {function create(context) {
      var myPath = (0, _contextCompat.getPhysicalFilename)(context);
      if (myPath === '<text>') {return {};} // can't cycle-check a non-file

      var options = context.options[0] || {};
      var maxDepth = typeof options.maxDepth === 'number' ? options.maxDepth : Infinity;
      var ignoreModule = function () {function ignoreModule(name) {return options.ignoreExternal && (0, _importType.isExternalModule)(
          name,
          (0, _resolve2['default'])(name, context),
          context);}return ignoreModule;}();


      var scc = options.disableScc ? {} : _scc2['default'].get(myPath, context);

      function checkSourceValue(sourceNode, importer) {
        if (ignoreModule(sourceNode.value)) {
          return; // ignore external modules
        }
        if (
        options.allowUnsafeDynamicCyclicDependency && (
        // Ignore `import()`
        importer.type === 'ImportExpression'
        // `require()` calls are always checked (if possible)
        || importer.type === 'CallExpression' && importer.callee.name !== 'require'))

        {
          return; // cycle via dynamic import allowed by config
        }

        if (
        importer.type === 'ImportDeclaration' && (
        // import type { Foo } (TS and Flow)
        importer.importKind === 'type'
        // import { type Foo } (Flow)
        || importer.specifiers.every(function (_ref) {var importKind = _ref.importKind;return importKind === 'type';})))

        {
          return; // ignore type imports
        }

        var imported = _builder2['default'].get(sourceNode.value, context);

        if (imported == null) {
          return; // no-unresolved territory
        }

        if (imported.path === myPath) {
          return; // no-self-import territory
        }

        /* If we're in the same Strongly Connected Component,
           * Then there exists a path from each node in the SCC to every other node in the SCC,
           * Then there exists at least one path from them to us and from us to them,
           * Then we have a cycle between us.
           */
        var hasDependencyCycle = options.disableScc || scc[myPath] === scc[imported.path];
        if (!hasDependencyCycle) {
          return;
        }

        var untraversed = [{ mget: function () {function mget() {return imported;}return mget;}(), route: [] }];
        function detectCycle(_ref2) {var mget = _ref2.mget,route = _ref2.route;
          var m = mget();
          if (m == null) {return;}
          if (traversed.has(m.path)) {return;}
          traversed.add(m.path);var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {

            for (var _iterator = m.imports[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var _ref3 = _step.value;var _ref4 = _slicedToArray(_ref3, 2);var path = _ref4[0];var _ref4$ = _ref4[1];var getter = _ref4$.getter;var declarations = _ref4$.declarations;
              // If we're in different SCCs, we can't have a circular dependency
              if (!options.disableScc && scc[myPath] !== scc[path]) {continue;}

              if (traversed.has(path)) {continue;}
              var toTraverse = [].concat(_toConsumableArray(declarations)).filter(function (_ref5) {var source = _ref5.source,isOnlyImportingTypes = _ref5.isOnlyImportingTypes;return !ignoreModule(source.value)
                // Ignore only type imports
                && !isOnlyImportingTypes;});


              /*
                                             If cyclic dependency is allowed via dynamic import, skip checking if any module is imported dynamically
                                             */
              if (options.allowUnsafeDynamicCyclicDependency && toTraverse.some(function (d) {return d.dynamic;})) {return;}

              /*
                                                                                                                             Only report as a cycle if there are any import declarations that are considered by
                                                                                                                             the rule. For example:
                                                                                                                              a.ts:
                                                                                                                             import { foo } from './b' // should not be reported as a cycle
                                                                                                                              b.ts:
                                                                                                                             import type { Bar } from './a'
                                                                                                                             */


              if (path === myPath && toTraverse.length > 0) {return true;}
              if (route.length + 1 < maxDepth) {var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
                  for (var _iterator2 = toTraverse[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var _ref6 = _step2.value;var source = _ref6.source;
                    untraversed.push({ mget: getter, route: route.concat(source) });
                  }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}
              }
            }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
        }

        while (untraversed.length > 0) {
          var next = untraversed.shift(); // bfs!
          if (detectCycle(next)) {
            var message = next.route.length > 0 ? 'Dependency cycle via ' + String(
            routeString(next.route)) :
            'Dependency cycle detected.';
            context.report(importer, message);
            return;
          }
        }
      }

      return Object.assign((0, _moduleVisitor2['default'])(checkSourceValue, context.options[0]), {
        'Program:exit': function () {function ProgramExit() {
            traversed.clear();
          }return ProgramExit;}() });

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby1jeWNsZS5qcyJdLCJuYW1lcyI6WyJ0cmF2ZXJzZWQiLCJTZXQiLCJyb3V0ZVN0cmluZyIsInJvdXRlIiwibWFwIiwicyIsInZhbHVlIiwibG9jIiwic3RhcnQiLCJsaW5lIiwiam9pbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidXJsIiwic2NoZW1hIiwibWF4RGVwdGgiLCJhbnlPZiIsIm1pbmltdW0iLCJpZ25vcmVFeHRlcm5hbCIsImFsbG93VW5zYWZlRHluYW1pY0N5Y2xpY0RlcGVuZGVuY3kiLCJkaXNhYmxlU2NjIiwiY3JlYXRlIiwiY29udGV4dCIsIm15UGF0aCIsIm9wdGlvbnMiLCJJbmZpbml0eSIsImlnbm9yZU1vZHVsZSIsIm5hbWUiLCJzY2MiLCJTdHJvbmdseUNvbm5lY3RlZENvbXBvbmVudHNCdWlsZGVyIiwiZ2V0IiwiY2hlY2tTb3VyY2VWYWx1ZSIsInNvdXJjZU5vZGUiLCJpbXBvcnRlciIsImNhbGxlZSIsImltcG9ydEtpbmQiLCJzcGVjaWZpZXJzIiwiZXZlcnkiLCJpbXBvcnRlZCIsIkV4cG9ydE1hcEJ1aWxkZXIiLCJwYXRoIiwiaGFzRGVwZW5kZW5jeUN5Y2xlIiwidW50cmF2ZXJzZWQiLCJtZ2V0IiwiZGV0ZWN0Q3ljbGUiLCJtIiwiaGFzIiwiYWRkIiwiaW1wb3J0cyIsImdldHRlciIsImRlY2xhcmF0aW9ucyIsInRvVHJhdmVyc2UiLCJmaWx0ZXIiLCJzb3VyY2UiLCJpc09ubHlJbXBvcnRpbmdUeXBlcyIsInNvbWUiLCJkIiwiZHluYW1pYyIsImxlbmd0aCIsInB1c2giLCJjb25jYXQiLCJuZXh0Iiwic2hpZnQiLCJtZXNzYWdlIiwicmVwb3J0IiwiT2JqZWN0IiwiYXNzaWduIiwiY2xlYXIiXSwibWFwcGluZ3MiOiJzb0JBQUE7Ozs7O0FBS0E7QUFDQSxrRTtBQUNBLHNEOztBQUVBLCtDO0FBQ0EsNkI7QUFD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Y25DLGdCQUFkLEVBQWdDVCxRQUFRRSxPQUFSLENBQWdCLENBQWhCLENBQWhDLENBQWQsRUFBbUU7QUFDeEUsc0JBRHdFLHNDQUN2RDtBQUNmN0Isc0JBQVV3RSxLQUFWO0FBQ0QsV0FIdUUsd0JBQW5FLENBQVA7O0FBS0QsS0E5SmMsbUJBQWpCIiwiZmlsZSI6Im5vLWN5Y2xlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZU92ZXJ2aWV3IEVuc3VyZXMgdGhhdCBubyBpbXBvcnRlZCBtb2R1bGUgaW1wb3J0cyB0aGUgbGludGVkIG1vZHVsZS5cbiAqIEBhdXRob3IgQmVuIE1vc2hlclxuICovXG5cbmltcG9ydCB7IGdldFBoeXNpY2FsRmlsZW5hbWUgfSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL2NvbnRleHRDb21wYXQnO1xuaW1wb3J0IG1vZHVsZVZpc2l0b3IsIHsgbWFrZU9wdGlvbnNTY2hlbWEgfSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL21vZHVsZVZpc2l0b3InO1xuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJztcblxuaW1wb3J0IEV4cG9ydE1hcEJ1aWxkZXIgZnJvbSAnLi4vZXhwb3J0TWFwL2J1aWxkZXInO1xuaW1wb3J0IFN0cm9uZ2x5Q29ubmVjdGVkQ29tcG9uZW50c0J1aWxkZXIgZnJvbSAnLi4vc2NjJztcbmltcG9ydCB7IGlzRXh0ZXJuYWxNb2R1bGUgfSBmcm9tICcuLi9jb3JlL2ltcG9ydFR5cGUnO1xuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XG5cbmNvbnN0IHRyYXZlcnNlZCA9IG5ldyBTZXQoKTtcblxuZnVuY3Rpb24gcm91dGVTdHJpbmcocm91dGUpIHtcbiAgcmV0dXJuIHJvdXRlLm1hcCgocykgPT4gYCR7cy52YWx1ZX06JHtzLmxvYy5zdGFydC5saW5lfWApLmpvaW4oJz0+Jyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgdHlwZTogJ3N1Z2dlc3Rpb24nLFxuICAgIGRvY3M6IHtcbiAgICAgIGNhdGVnb3J5OiAnU3RhdGljIGFuYWx5c2lzJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRm9yYmlkIGEgbW9kdWxlIGZyb20gaW1wb3J0aW5nIGEgbW9kdWxlIHdpdGggYSBkZXBlbmRlbmN5IHBhdGggYmFjayB0byBpdHNlbGYuJyxcbiAgICAgIHVybDogZG9jc1VybCgnbm8tY3ljbGUnKSxcbiAgICB9LFxuICAgIHNjaGVtYTogW21ha2VPcHRpb25zU2NoZW1hKHtcbiAgICAgIG1heERlcHRoOiB7XG4gICAgICAgIGFueU9mOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdtYXhpbXVtIGRlcGVuZGVuY3kgZGVwdGggdG8gdHJhdmVyc2UnLFxuICAgICAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICAgICAgbWluaW11bTogMSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGVudW06IFsn4oieJ10sXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIGlnbm9yZUV4dGVybmFsOiB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnaWdub3JlIGV4dGVybmFsIG1vZHVsZXMnLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIGFsbG93VW5zYWZlRHluYW1pY0N5Y2xpY0RlcGVuZGVuY3k6IHtcbiAgICAgICAgZGVzY3JpcHRpb246ICdBbGxvdyBjeWNsaWMgZGVwZW5kZW5jeSBpZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgZHluYW1pYyBpbXBvcnQgaW4gdGhlIGNoYWluJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBkaXNhYmxlU2NjOiB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnV2hlbiB0cnVlLCBkb25cXCd0IGNhbGN1bGF0ZSBhIHN0cm9uZ2x5LWNvbm5lY3RlZC1jb21wb25lbnRzIGdyYXBoLiBTQ0MgaXMgdXNlZCB0byByZWR1Y2UgdGhlIHRpbWUtY29tcGxleGl0eSBvZiBjeWNsZSBkZXRlY3Rpb24sIGJ1dCBhZGRzIG92ZXJoZWFkLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB9LFxuICAgIH0pXSxcbiAgfSxcblxuICBjcmVhdGUoY29udGV4dCkge1xuICAgIGNvbnN0IG15UGF0aCA9IGdldFBoeXNpY2FsRmlsZW5hbWUoY29udGV4dCk7XG4gICAgaWYgKG15UGF0aCA9PT0gJzx0ZXh0PicpIHsgcmV0dXJuIHt9OyB9IC8vIGNhbid0IGN5Y2xlLWNoZWNrIGEgbm9uLWZpbGVcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBjb250ZXh0Lm9wdGlvbnNbMF0gfHwge307XG4gICAgY29uc3QgbWF4RGVwdGggPSB0eXBlb2Ygb3B0aW9ucy5tYXhEZXB0aCA9PT0gJ251bWJlcicgPyBvcHRpb25zLm1heERlcHRoIDogSW5maW5pdHk7XG4gICAgY29uc3QgaWdub3JlTW9kdWxlID0gKG5hbWUpID0+IG9wdGlvbnMuaWdub3JlRXh0ZXJuYWwgJiYgaXNFeHRlcm5hbE1vZHVsZShcbiAgICAgIG5hbWUsXG4gICAgICByZXNvbHZlKG5hbWUsIGNvbnRleHQpLFxuICAgICAgY29udGV4dCxcbiAgICApO1xuXG4gICAgY29uc3Qgc2NjID0gb3B0aW9ucy5kaXNhYmxlU2NjID8ge30gOiBTdHJvbmdseUNvbm5lY3RlZENvbXBvbmVudHNCdWlsZGVyLmdldChteVBhdGgsIGNvbnRleHQpO1xuXG4gICAgZnVuY3Rpb24gY2hlY2tTb3VyY2VWYWx1ZShzb3VyY2VOb2RlLCBpbXBvcnRlcikge1xuICAgICAgaWYgKGlnbm9yZU1vZHVsZShzb3VyY2VOb2RlLnZhbHVlKSkge1xuICAgICAgICByZXR1cm47IC8vIGlnbm9yZSBleHRlcm5hbCBtb2R1bGVzXG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIG9wdGlvbnMuYWxsb3dVbnNhZmVEeW5hbWljQ3ljbGljRGVwZW5kZW5jeSAmJiAoXG4gICAgICAgICAgLy8gSWdub3JlIGBpbXBvcnQoKWBcbiAgICAgICAgICBpbXBvcnRlci50eXBlID09PSAnSW1wb3J0RXhwcmVzc2lvbidcbiAgICAgICAgICAvLyBgcmVxdWlyZSgpYCBjYWxscyBhcmUgYWx3YXlzIGNoZWNrZWQgKGlmIHBvc3NpYmxlKVxuICAgICAgICAgIHx8IGltcG9ydGVyLnR5cGUgPT09ICdDYWxsRXhwcmVzc2lvbicgJiYgaW1wb3J0ZXIuY2FsbGVlLm5hbWUgIT09ICdyZXF1aXJlJ1xuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuOyAvLyBjeWNsZSB2aWEgZHluYW1pYyBpbXBvcnQgYWxsb3dlZCBieSBjb25maWdcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICBpbXBvcnRlci50eXBlID09PSAnSW1wb3J0RGVjbGFyYXRpb24nICYmIChcbiAgICAgICAgICAvLyBpbXBvcnQgdHlwZSB7IEZvbyB9IChUUyBhbmQgRmxvdylcbiAgICAgICAgICBpbXBvcnRlci5pbXBvcnRLaW5kID09PSAndHlwZSdcbiAgICAgICAgICAvLyBpbXBvcnQgeyB0eXBlIEZvbyB9IChGbG93KVxuICAgICAgICAgIHx8IGltcG9ydGVyLnNwZWNpZmllcnMuZXZlcnkoKHsgaW1wb3J0S2luZCB9KSA9PiBpbXBvcnRLaW5kID09PSAndHlwZScpXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICByZXR1cm47IC8vIGlnbm9yZSB0eXBlIGltcG9ydHNcbiAgICAgIH1cblxuICAgICAgY29uc3QgaW1wb3J0ZWQgPSBFeHBvcnRNYXBCdWlsZGVyLmdldChzb3VyY2VOb2RlLnZhbHVlLCBjb250ZXh0KTtcblxuICAgICAgaWYgKGltcG9ydGVkID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuOyAgLy8gbm8tdW5yZXNvbHZlZCB0ZXJyaXRvcnlcbiAgICAgIH1cblxuICAgICAgaWYgKGltcG9ydGVkLnBhdGggPT09IG15UGF0aCkge1xuICAgICAgICByZXR1cm47ICAvLyBuby1zZWxmLWltcG9ydCB0ZXJyaXRvcnlcbiAgICAgIH1cblxuICAgICAgLyogSWYgd2UncmUgaW4gdGhlIHNhbWUgU3Ryb25nbHkgQ29ubmVjdGVkIENvbXBvbmVudCxcbiAgICAgICAqIFRoZW4gdGhlcmUgZXhpc3RzIGEgcGF0aCBmcm9tIGVhY2ggbm9kZSBpbiB0aGUgU0NDIHRvIGV2ZXJ5IG90aGVyIG5vZGUgaW4gdGhlIFNDQyxcbiAgICAgICAqIFRoZW4gdGhlcmUgZXhpc3RzIGF0IGxlYXN0IG9uZSBwYXRoIGZyb20gdGhlbSB0byB1cyBhbmQgZnJvbSB1cyB0byB0aGVtLFxuICAgICAgICogVGhlbiB3ZSBoYXZlIGEgY3ljbGUgYmV0d2VlbiB1cy5cbiAgICAgICAqL1xuICAgICAgY29uc3QgaGFzRGVwZW5kZW5jeUN5Y2xlID0gb3B0aW9ucy5kaXNhYmxlU2NjIHx8IHNjY1tteVBhdGhdID09PSBzY2NbaW1wb3J0ZWQucGF0aF07XG4gICAgICBpZiAoIWhhc0RlcGVuZGVuY3lDeWNsZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVudHJhdmVyc2VkID0gW3sgbWdldDogKCkgPT4gaW1wb3J0ZWQsIHJvdXRlOiBbXSB9XTtcbiAgICAgIGZ1bmN0aW9uIGRldGVjdEN5Y2xlKHsgbWdldCwgcm91dGUgfSkge1xuICAgICAgICBjb25zdCBtID0gbWdldCgpO1xuICAgICAgICBpZiAobSA9PSBudWxsKSB7IHJldHVybjsgfVxuICAgICAgICBpZiAodHJhdmVyc2VkLmhhcyhtLnBhdGgpKSB7IHJldHVybjsgfVxuICAgICAgICB0cmF2ZXJzZWQuYWRkKG0ucGF0aCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBbcGF0aCwgeyBnZXR0ZXIsIGRlY2xhcmF0aW9ucyB9XSBvZiBtLmltcG9ydHMpIHtcbiAgICAgICAgICAvLyBJZiB3ZSdyZSBpbiBkaWZmZXJlbnQgU0NDcywgd2UgY2FuJ3QgaGF2ZSBhIGNpcmN1bGFyIGRlcGVuZGVuY3lcbiAgICAgICAgICBpZiAoIW9wdGlvbnMuZGlzYWJsZVNjYyAmJiBzY2NbbXlQYXRoXSAhPT0gc2NjW3BhdGhdKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgICAgICBpZiAodHJhdmVyc2VkLmhhcyhwYXRoKSkgeyBjb250aW51ZTsgfVxuICAgICAgICAgIGNvbnN0IHRvVHJhdmVyc2UgPSBbLi4uZGVjbGFyYXRpb25zXS5maWx0ZXIoKHsgc291cmNlLCBpc09ubHlJbXBvcnRpbmdUeXBlcyB9KSA9PiAhaWdub3JlTW9kdWxlKHNvdXJjZS52YWx1ZSlcbiAgICAgICAgICAgIC8vIElnbm9yZSBvbmx5IHR5cGUgaW1wb3J0c1xuICAgICAgICAgICAgJiYgIWlzT25seUltcG9ydGluZ1R5cGVzLFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAvKlxuICAgICAgICAgIElmIGN5Y2xpYyBkZXBlbmRlbmN5IGlzIGFsbG93ZWQgdmlhIGR5bmFtaWMgaW1wb3J0LCBza2lwIGNoZWNraW5nIGlmIGFueSBtb2R1bGUgaXMgaW1wb3J0ZWQgZHluYW1pY2FsbHlcbiAgICAgICAgICAqL1xuICAgICAgICAgIGlmIChvcHRpb25zLmFsbG93VW5zYWZlRHluYW1pY0N5Y2xpY0RlcGVuZGVuY3kgJiYgdG9UcmF2ZXJzZS5zb21lKChkKSA9PiBkLmR5bmFtaWMpKSB7IHJldHVybjsgfVxuXG4gICAgICAgICAgLypcbiAgICAgICAgICBPbmx5IHJlcG9ydCBhcyBhIGN5Y2xlIGlmIHRoZXJlIGFyZSBhbnkgaW1wb3J0IGRlY2xhcmF0aW9ucyB0aGF0IGFyZSBjb25zaWRlcmVkIGJ5XG4gICAgICAgICAgdGhlIHJ1bGUuIEZvciBleGFtcGxlOlxuXG4gICAgICAgICAgYS50czpcbiAgICAgICAgICBpbXBvcnQgeyBmb28gfSBmcm9tICcuL2InIC8vIHNob3VsZCBub3QgYmUgcmVwb3J0ZWQgYXMgYSBjeWNsZVxuXG4gICAgICAgICAgYi50czpcbiAgICAgICAgICBpbXBvcnQgdHlwZSB7IEJhciB9IGZyb20gJy4vYSdcbiAgICAgICAgICAqL1xuICAgICAgICAgIGlmIChwYXRoID09PSBteVBhdGggJiYgdG9UcmF2ZXJzZS5sZW5ndGggPiAwKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgaWYgKHJvdXRlLmxlbmd0aCArIDEgPCBtYXhEZXB0aCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IHNvdXJjZSB9IG9mIHRvVHJhdmVyc2UpIHtcbiAgICAgICAgICAgICAgdW50cmF2ZXJzZWQucHVzaCh7IG1nZXQ6IGdldHRlciwgcm91dGU6IHJvdXRlLmNvbmNhdChzb3VyY2UpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB3aGlsZSAodW50cmF2ZXJzZWQubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBuZXh0ID0gdW50cmF2ZXJzZWQuc2hpZnQoKTsgLy8gYmZzIVxuICAgICAgICBpZiAoZGV0ZWN0Q3ljbGUobmV4dCkpIHtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gbmV4dC5yb3V0ZS5sZW5ndGggPiAwXG4gICAgICAgICAgICA/IGBEZXBlbmRlbmN5IGN5Y2xlIHZpYSAke3JvdXRlU3RyaW5nKG5leHQucm91dGUpfWBcbiAgICAgICAgICAgIDogJ0RlcGVuZGVuY3kgY3ljbGUgZGV0ZWN0ZWQuJztcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydChpbXBvcnRlciwgbWVzc2FnZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obW9kdWxlVmlzaXRvcihjaGVja1NvdXJjZVZhbHVlLCBjb250ZXh0Lm9wdGlvbnNbMF0pLCB7XG4gICAgICAnUHJvZ3JhbTpleGl0JygpIHtcbiAgICAgICAgdHJhdmVyc2VkLmNsZWFyKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9LFxufTtcbiJdfQ==