'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.captureDependency = captureDependency;exports.

































captureDependencyWithSpecifiers = captureDependencyWithSpecifiers;function captureDependency(_ref, isOnlyImportingTypes, remotePathResolver, exportMap, context, thunkFor) {var source = _ref.source;var importedSpecifiers = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : new Set();if (source == null) {return null;}var p = remotePathResolver.resolve(source.value);if (p == null) {return null;}var declarationMetadata = { // capturing actual node reference holds full AST in memory!
    source: { value: source.value, loc: source.loc }, isOnlyImportingTypes: isOnlyImportingTypes, importedSpecifiers: importedSpecifiers };var existing = exportMap.imports.get(p);if (existing != null) {existing.declarations.add(declarationMetadata);return existing.getter;}var getter = thunkFor(p, context);exportMap.imports.set(p, { getter: getter, declarations: new Set([declarationMetadata]) });return getter;}var supportedImportTypes = new Set(['ImportDefaultSpecifier', 'ImportNamespaceSpecifier']);function captureDependencyWithSpecifiers(n,
remotePathResolver,
exportMap,
context,
thunkFor)
{
  // import type { Foo } (TS and Flow); import typeof { Foo } (Flow)
  var declarationIsType = n.importKind === 'type' || n.importKind === 'typeof';
  // import './foo' or import {} from './foo' (both 0 specifiers) is a side effect and
  // shouldn't be considered to be just importing types
  var specifiersOnlyImportingTypes = n.specifiers.length > 0;
  var importedSpecifiers = new Set();
  n.specifiers.forEach(function (specifier) {
    if (specifier.type === 'ImportSpecifier') {
      importedSpecifiers.add(specifier.imported.name || specifier.imported.value);
    } else if (supportedImportTypes.has(specifier.type)) {
      importedSpecifiers.add(specifier.type);
    }

    // import { type Foo } (Flow); import { typeof Foo } (Flow)
    specifiersOnlyImportingTypes = specifiersOnlyImportingTypes && (
    specifier.importKind === 'type' || specifier.importKind === 'typeof');
  });
  captureDependency(n, declarationIsType || specifiersOnlyImportingTypes, remotePathResolver, exportMap, context, thunkFor, importedSpecifiers);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHBvcnRNYXAvY2FwdHVyZURlcGVuZGVuY3kuanMiXSwibmFtZXMiOlsiY2FwdHVyZURlcGVuZGVuY3kiLCJjYXB0dXJlRGVwZW5kZW5jeVdpdGhTcGVjaWZpZXJzIiwiaXNPbmx5SW1wb3J0aW5nVHlwZXMiLCJyZW1vdGVQYXRoUmVzb2x2ZXIiLCJleHBvcnRNYXAiLCJjb250ZXh0IiwidGh1bmtGb3IiLCJzb3VyY2UiLCJpbXBvcnRlZFNwZWNpZmllcnMiLCJTZXQiLCJwIiwicmVzb2x2ZSIsInZhbHVlIiwiZGVjbGFyYXRpb25NZXRhZGF0YSIsImxvYyIsImV4aXN0aW5nIiwiaW1wb3J0cyIsImdldCIsImRlY2xhcmF0aW9ucyIsImFkZCIsImdldHRlciIsInNldCIsInN1cHBvcnRlZEltcG9ydFR5cGVzIiwibiIsImRlY2xhcmF0aW9uSXNUeXBlIiwiaW1wb3J0S2luZCIsInNwZWNpZmllcnNPbmx5SW1wb3J0aW5nVHlwZXMiLCJzcGVjaWZpZXJzIiwibGVuZ3RoIiwiZm9yRWFjaCIsInNwZWNpZmllciIsInR5cGUiLCJpbXBvcnRlZCIsIm5hbWUiLCJoYXMiXSwibWFwcGluZ3MiOiJtRkFBZ0JBLGlCLEdBQUFBLGlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0NBQywrQixHQUFBQSwrQixDQWxDVCxTQUFTRCxpQkFBVCxPQUVMRSxvQkFGSyxFQUdMQyxrQkFISyxFQUlMQyxTQUpLLEVBS0xDLE9BTEssRUFNTEMsUUFOSyxFQVFMLEtBUEVDLE1BT0YsUUFQRUEsTUFPRixLQURBQyxrQkFDQSx1RUFEcUIsSUFBSUMsR0FBSixFQUNyQixDQUNBLElBQUlGLFVBQVUsSUFBZCxFQUFvQixDQUFFLE9BQU8sSUFBUCxDQUFjLENBRXBDLElBQU1HLElBQUlQLG1CQUFtQlEsT0FBbkIsQ0FBMkJKLE9BQU9LLEtBQWxDLENBQVYsQ0FDQSxJQUFJRixLQUFLLElBQVQsRUFBZSxDQUFFLE9BQU8sSUFBUCxDQUFjLENBRS9CLElBQU1HLHNCQUFzQixFQUMxQjtBQUNBTixZQUFRLEVBQUVLLE9BQU9MLE9BQU9LLEtBQWhCLEVBQXVCRSxLQUFLUCxPQUFPTyxHQUFuQyxFQUZrQixFQUcxQlosMENBSDBCLEVBSTFCTSxzQ0FKMEIsRUFBNUIsQ0FPQSxJQUFNTyxXQUFXWCxVQUFVWSxPQUFWLENBQWtCQyxHQUFsQixDQUFzQlAsQ0FBdEIsQ0FBakIsQ0FDQSxJQUFJSyxZQUFZLElBQWhCLEVBQXNCLENBQ3BCQSxTQUFTRyxZQUFULENBQXNCQyxHQUF0QixDQUEwQk4sbUJBQTFCLEVBQ0EsT0FBT0UsU0FBU0ssTUFBaEIsQ0FDRCxDQUVELElBQU1BLFNBQVNkLFNBQVNJLENBQVQsRUFBWUwsT0FBWixDQUFmLENBQ0FELFVBQVVZLE9BQVYsQ0FBa0JLLEdBQWxCLENBQXNCWCxDQUF0QixFQUF5QixFQUFFVSxjQUFGLEVBQVVGLGNBQWMsSUFBSVQsR0FBSixDQUFRLENBQUNJLG1CQUFELENBQVIsQ0FBeEIsRUFBekIsRUFDQSxPQUFPTyxNQUFQLENBQ0QsQ0FFRCxJQUFNRSx1QkFBdUIsSUFBSWIsR0FBSixDQUFRLENBQUMsd0JBQUQsRUFBMkIsMEJBQTNCLENBQVIsQ0FBN0IsQ0FFTyxTQUFTUiwrQkFBVCxDQUNMc0IsQ0FESztBQUVMcEIsa0JBRks7QUFHTEMsU0FISztBQUlMQyxPQUpLO0FBS0xDLFFBTEs7QUFNTDtBQUNBO0FBQ0EsTUFBTWtCLG9CQUFvQkQsRUFBRUUsVUFBRixLQUFpQixNQUFqQixJQUEyQkYsRUFBRUUsVUFBRixLQUFpQixRQUF0RTtBQUNBO0FBQ0E7QUFDQSxNQUFJQywrQkFBK0JILEVBQUVJLFVBQUYsQ0FBYUMsTUFBYixHQUFzQixDQUF6RDtBQUNBLE1BQU1wQixxQkFBcUIsSUFBSUMsR0FBSixFQUEzQjtBQUNBYyxJQUFFSSxVQUFGLENBQWFFLE9BQWIsQ0FBcUIsVUFBQ0MsU0FBRCxFQUFlO0FBQ2xDLFFBQUlBLFVBQVVDLElBQVYsS0FBbUIsaUJBQXZCLEVBQTBDO0FBQ3hDdkIseUJBQW1CVyxHQUFuQixDQUF1QlcsVUFBVUUsUUFBVixDQUFtQkMsSUFBbkIsSUFBMkJILFVBQVVFLFFBQVYsQ0FBbUJwQixLQUFyRTtBQUNELEtBRkQsTUFFTyxJQUFJVSxxQkFBcUJZLEdBQXJCLENBQXlCSixVQUFVQyxJQUFuQyxDQUFKLEVBQThDO0FBQ25EdkIseUJBQW1CVyxHQUFuQixDQUF1QlcsVUFBVUMsSUFBakM7QUFDRDs7QUFFRDtBQUNBTCxtQ0FBK0JBO0FBQ3pCSSxjQUFVTCxVQUFWLEtBQXlCLE1BQXpCLElBQW1DSyxVQUFVTCxVQUFWLEtBQXlCLFFBRG5DLENBQS9CO0FBRUQsR0FWRDtBQVdBekIsb0JBQWtCdUIsQ0FBbEIsRUFBcUJDLHFCQUFxQkUsNEJBQTFDLEVBQXdFdkIsa0JBQXhFLEVBQTRGQyxTQUE1RixFQUF1R0MsT0FBdkcsRUFBZ0hDLFFBQWhILEVBQTBIRSxrQkFBMUg7QUFDRCIsImZpbGUiOiJjYXB0dXJlRGVwZW5kZW5jeS5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBjYXB0dXJlRGVwZW5kZW5jeShcbiAgeyBzb3VyY2UgfSxcbiAgaXNPbmx5SW1wb3J0aW5nVHlwZXMsXG4gIHJlbW90ZVBhdGhSZXNvbHZlcixcbiAgZXhwb3J0TWFwLFxuICBjb250ZXh0LFxuICB0aHVua0ZvcixcbiAgaW1wb3J0ZWRTcGVjaWZpZXJzID0gbmV3IFNldCgpLFxuKSB7XG4gIGlmIChzb3VyY2UgPT0gbnVsbCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIGNvbnN0IHAgPSByZW1vdGVQYXRoUmVzb2x2ZXIucmVzb2x2ZShzb3VyY2UudmFsdWUpO1xuICBpZiAocCA9PSBudWxsKSB7IHJldHVybiBudWxsOyB9XG5cbiAgY29uc3QgZGVjbGFyYXRpb25NZXRhZGF0YSA9IHtcbiAgICAvLyBjYXB0dXJpbmcgYWN0dWFsIG5vZGUgcmVmZXJlbmNlIGhvbGRzIGZ1bGwgQVNUIGluIG1lbW9yeSFcbiAgICBzb3VyY2U6IHsgdmFsdWU6IHNvdXJjZS52YWx1ZSwgbG9jOiBzb3VyY2UubG9jIH0sXG4gICAgaXNPbmx5SW1wb3J0aW5nVHlwZXMsXG4gICAgaW1wb3J0ZWRTcGVjaWZpZXJzLFxuICB9O1xuXG4gIGNvbnN0IGV4aXN0aW5nID0gZXhwb3J0TWFwLmltcG9ydHMuZ2V0KHApO1xuICBpZiAoZXhpc3RpbmcgIT0gbnVsbCkge1xuICAgIGV4aXN0aW5nLmRlY2xhcmF0aW9ucy5hZGQoZGVjbGFyYXRpb25NZXRhZGF0YSk7XG4gICAgcmV0dXJuIGV4aXN0aW5nLmdldHRlcjtcbiAgfVxuXG4gIGNvbnN0IGdldHRlciA9IHRodW5rRm9yKHAsIGNvbnRleHQpO1xuICBleHBvcnRNYXAuaW1wb3J0cy5zZXQocCwgeyBnZXR0ZXIsIGRlY2xhcmF0aW9uczogbmV3IFNldChbZGVjbGFyYXRpb25NZXRhZGF0YV0pIH0pO1xuICByZXR1cm4gZ2V0dGVyO1xufVxuXG5jb25zdCBzdXBwb3J0ZWRJbXBvcnRUeXBlcyA9IG5ldyBTZXQoWydJbXBvcnREZWZhdWx0U3BlY2lmaWVyJywgJ0ltcG9ydE5hbWVzcGFjZVNwZWNpZmllciddKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNhcHR1cmVEZXBlbmRlbmN5V2l0aFNwZWNpZmllcnMoXG4gIG4sXG4gIHJlbW90ZVBhdGhSZXNvbHZlcixcbiAgZXhwb3J0TWFwLFxuICBjb250ZXh0LFxuICB0aHVua0Zvcixcbikge1xuICAvLyBpbXBvcnQgdHlwZSB7IEZvbyB9IChUUyBhbmQgRmxvdyk7IGltcG9ydCB0eXBlb2YgeyBGb28gfSAoRmxvdylcbiAgY29uc3QgZGVjbGFyYXRpb25Jc1R5cGUgPSBuLmltcG9ydEtpbmQgPT09ICd0eXBlJyB8fCBuLmltcG9ydEtpbmQgPT09ICd0eXBlb2YnO1xuICAvLyBpbXBvcnQgJy4vZm9vJyBvciBpbXBvcnQge30gZnJvbSAnLi9mb28nIChib3RoIDAgc3BlY2lmaWVycykgaXMgYSBzaWRlIGVmZmVjdCBhbmRcbiAgLy8gc2hvdWxkbid0IGJlIGNvbnNpZGVyZWQgdG8gYmUganVzdCBpbXBvcnRpbmcgdHlwZXNcbiAgbGV0IHNwZWNpZmllcnNPbmx5SW1wb3J0aW5nVHlwZXMgPSBuLnNwZWNpZmllcnMubGVuZ3RoID4gMDtcbiAgY29uc3QgaW1wb3J0ZWRTcGVjaWZpZXJzID0gbmV3IFNldCgpO1xuICBuLnNwZWNpZmllcnMuZm9yRWFjaCgoc3BlY2lmaWVyKSA9PiB7XG4gICAgaWYgKHNwZWNpZmllci50eXBlID09PSAnSW1wb3J0U3BlY2lmaWVyJykge1xuICAgICAgaW1wb3J0ZWRTcGVjaWZpZXJzLmFkZChzcGVjaWZpZXIuaW1wb3J0ZWQubmFtZSB8fCBzcGVjaWZpZXIuaW1wb3J0ZWQudmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoc3VwcG9ydGVkSW1wb3J0VHlwZXMuaGFzKHNwZWNpZmllci50eXBlKSkge1xuICAgICAgaW1wb3J0ZWRTcGVjaWZpZXJzLmFkZChzcGVjaWZpZXIudHlwZSk7XG4gICAgfVxuXG4gICAgLy8gaW1wb3J0IHsgdHlwZSBGb28gfSAoRmxvdyk7IGltcG9ydCB7IHR5cGVvZiBGb28gfSAoRmxvdylcbiAgICBzcGVjaWZpZXJzT25seUltcG9ydGluZ1R5cGVzID0gc3BlY2lmaWVyc09ubHlJbXBvcnRpbmdUeXBlc1xuICAgICAgJiYgKHNwZWNpZmllci5pbXBvcnRLaW5kID09PSAndHlwZScgfHwgc3BlY2lmaWVyLmltcG9ydEtpbmQgPT09ICd0eXBlb2YnKTtcbiAgfSk7XG4gIGNhcHR1cmVEZXBlbmRlbmN5KG4sIGRlY2xhcmF0aW9uSXNUeXBlIHx8IHNwZWNpZmllcnNPbmx5SW1wb3J0aW5nVHlwZXMsIHJlbW90ZVBhdGhSZXNvbHZlciwgZXhwb3J0TWFwLCBjb250ZXh0LCB0aHVua0ZvciwgaW1wb3J0ZWRTcGVjaWZpZXJzKTtcbn1cbiJdfQ==