'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports['default'] = processSpecifier;function processSpecifier(specifier, astNode, exportMap, namespace) {
  var nsource = astNode.source && astNode.source.value;
  var exportMeta = {};
  var local = void 0;

  switch (specifier.type) {
    case 'ExportDefaultSpecifier':
      if (!nsource) {return;}
      local = 'default';
      break;
    case 'ExportNamespaceSpecifier':
      exportMap.namespace.set(specifier.exported.name, Object.defineProperty(exportMeta, 'namespace', {
        get: function () {function get() {return namespace.resolveImport(nsource);}return get;}() }));

      return;
    case 'ExportAllDeclaration':
      exportMap.namespace.set(specifier.exported.name || specifier.exported.value, namespace.add(exportMeta, specifier.source.value));
      return;
    case 'ExportSpecifier':
      if (!astNode.source) {
        exportMap.namespace.set(specifier.exported.name || specifier.exported.value, namespace.add(exportMeta, specifier.local));
        return;
      }
    // else falls through
    default:
      local = specifier.local.name;
      break;}


  // todo: JSDoc
  exportMap.reexports.set(specifier.exported.name, { local: local, getImport: function () {function getImport() {return namespace.resolveImport(nsource);}return getImport;}() });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHBvcnRNYXAvc3BlY2lmaWVyLmpzIl0sIm5hbWVzIjpbInByb2Nlc3NTcGVjaWZpZXIiLCJzcGVjaWZpZXIiLCJhc3ROb2RlIiwiZXhwb3J0TWFwIiwibmFtZXNwYWNlIiwibnNvdXJjZSIsInNvdXJjZSIsInZhbHVlIiwiZXhwb3J0TWV0YSIsImxvY2FsIiwidHlwZSIsInNldCIsImV4cG9ydGVkIiwibmFtZSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZ2V0IiwicmVzb2x2ZUltcG9ydCIsImFkZCIsInJlZXhwb3J0cyIsImdldEltcG9ydCJdLCJtYXBwaW5ncyI6ImdHQUF3QkEsZ0IsQ0FBVCxTQUFTQSxnQkFBVCxDQUEwQkMsU0FBMUIsRUFBcUNDLE9BQXJDLEVBQThDQyxTQUE5QyxFQUF5REMsU0FBekQsRUFBb0U7QUFDakYsTUFBTUMsVUFBVUgsUUFBUUksTUFBUixJQUFrQkosUUFBUUksTUFBUixDQUFlQyxLQUFqRDtBQUNBLE1BQU1DLGFBQWEsRUFBbkI7QUFDQSxNQUFJQyxjQUFKOztBQUVBLFVBQVFSLFVBQVVTLElBQWxCO0FBQ0UsU0FBSyx3QkFBTDtBQUNFLFVBQUksQ0FBQ0wsT0FBTCxFQUFjLENBQUUsT0FBUztBQUN6QkksY0FBUSxTQUFSO0FBQ0E7QUFDRixTQUFLLDBCQUFMO0FBQ0VOLGdCQUFVQyxTQUFWLENBQW9CTyxHQUFwQixDQUF3QlYsVUFBVVcsUUFBVixDQUFtQkMsSUFBM0MsRUFBaURDLE9BQU9DLGNBQVAsQ0FBc0JQLFVBQXRCLEVBQWtDLFdBQWxDLEVBQStDO0FBQzlGUSxXQUQ4Riw4QkFDeEYsQ0FBRSxPQUFPWixVQUFVYSxhQUFWLENBQXdCWixPQUF4QixDQUFQLENBQTBDLENBRDRDLGdCQUEvQyxDQUFqRDs7QUFHQTtBQUNGLFNBQUssc0JBQUw7QUFDRUYsZ0JBQVVDLFNBQVYsQ0FBb0JPLEdBQXBCLENBQXdCVixVQUFVVyxRQUFWLENBQW1CQyxJQUFuQixJQUEyQlosVUFBVVcsUUFBVixDQUFtQkwsS0FBdEUsRUFBNkVILFVBQVVjLEdBQVYsQ0FBY1YsVUFBZCxFQUEwQlAsVUFBVUssTUFBVixDQUFpQkMsS0FBM0MsQ0FBN0U7QUFDQTtBQUNGLFNBQUssaUJBQUw7QUFDRSxVQUFJLENBQUNMLFFBQVFJLE1BQWIsRUFBcUI7QUFDbkJILGtCQUFVQyxTQUFWLENBQW9CTyxHQUFwQixDQUF3QlYsVUFBVVcsUUFBVixDQUFtQkMsSUFBbkIsSUFBMkJaLFVBQVVXLFFBQVYsQ0FBbUJMLEtBQXRFLEVBQTZFSCxVQUFVYyxHQUFWLENBQWNWLFVBQWQsRUFBMEJQLFVBQVVRLEtBQXBDLENBQTdFO0FBQ0E7QUFDRDtBQUNIO0FBQ0E7QUFDRUEsY0FBUVIsVUFBVVEsS0FBVixDQUFnQkksSUFBeEI7QUFDQSxZQXJCSjs7O0FBd0JBO0FBQ0FWLFlBQVVnQixTQUFWLENBQW9CUixHQUFwQixDQUF3QlYsVUFBVVcsUUFBVixDQUFtQkMsSUFBM0MsRUFBaUQsRUFBRUosWUFBRixFQUFTVyx3QkFBVyw2QkFBTWhCLFVBQVVhLGFBQVYsQ0FBd0JaLE9BQXhCLENBQU4sRUFBWCxvQkFBVCxFQUFqRDtBQUNEIiwiZmlsZSI6InNwZWNpZmllci5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHByb2Nlc3NTcGVjaWZpZXIoc3BlY2lmaWVyLCBhc3ROb2RlLCBleHBvcnRNYXAsIG5hbWVzcGFjZSkge1xuICBjb25zdCBuc291cmNlID0gYXN0Tm9kZS5zb3VyY2UgJiYgYXN0Tm9kZS5zb3VyY2UudmFsdWU7XG4gIGNvbnN0IGV4cG9ydE1ldGEgPSB7fTtcbiAgbGV0IGxvY2FsO1xuXG4gIHN3aXRjaCAoc3BlY2lmaWVyLnR5cGUpIHtcbiAgICBjYXNlICdFeHBvcnREZWZhdWx0U3BlY2lmaWVyJzpcbiAgICAgIGlmICghbnNvdXJjZSkgeyByZXR1cm47IH1cbiAgICAgIGxvY2FsID0gJ2RlZmF1bHQnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRXhwb3J0TmFtZXNwYWNlU3BlY2lmaWVyJzpcbiAgICAgIGV4cG9ydE1hcC5uYW1lc3BhY2Uuc2V0KHNwZWNpZmllci5leHBvcnRlZC5uYW1lLCBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0TWV0YSwgJ25hbWVzcGFjZScsIHtcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gbmFtZXNwYWNlLnJlc29sdmVJbXBvcnQobnNvdXJjZSk7IH0sXG4gICAgICB9KSk7XG4gICAgICByZXR1cm47XG4gICAgY2FzZSAnRXhwb3J0QWxsRGVjbGFyYXRpb24nOlxuICAgICAgZXhwb3J0TWFwLm5hbWVzcGFjZS5zZXQoc3BlY2lmaWVyLmV4cG9ydGVkLm5hbWUgfHwgc3BlY2lmaWVyLmV4cG9ydGVkLnZhbHVlLCBuYW1lc3BhY2UuYWRkKGV4cG9ydE1ldGEsIHNwZWNpZmllci5zb3VyY2UudmFsdWUpKTtcbiAgICAgIHJldHVybjtcbiAgICBjYXNlICdFeHBvcnRTcGVjaWZpZXInOlxuICAgICAgaWYgKCFhc3ROb2RlLnNvdXJjZSkge1xuICAgICAgICBleHBvcnRNYXAubmFtZXNwYWNlLnNldChzcGVjaWZpZXIuZXhwb3J0ZWQubmFtZSB8fCBzcGVjaWZpZXIuZXhwb3J0ZWQudmFsdWUsIG5hbWVzcGFjZS5hZGQoZXhwb3J0TWV0YSwgc3BlY2lmaWVyLmxvY2FsKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAvLyBlbHNlIGZhbGxzIHRocm91Z2hcbiAgICBkZWZhdWx0OlxuICAgICAgbG9jYWwgPSBzcGVjaWZpZXIubG9jYWwubmFtZTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgLy8gdG9kbzogSlNEb2NcbiAgZXhwb3J0TWFwLnJlZXhwb3J0cy5zZXQoc3BlY2lmaWVyLmV4cG9ydGVkLm5hbWUsIHsgbG9jYWwsIGdldEltcG9ydDogKCkgPT4gbmFtZXNwYWNlLnJlc29sdmVJbXBvcnQobnNvdXJjZSkgfSk7XG59XG4iXX0=