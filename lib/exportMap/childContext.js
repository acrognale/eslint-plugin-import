'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports['default'] =










childContext;var _hash = require('eslint-module-utils/hash');var parserOptionsHash = '';var prevParserOptions = '';var settingsHash = '';var prevSettings = ''; /**
                                                                                                                                                                 * don't hold full context object in memory, just grab what we need.
                                                                                                                                                                 * also calculate a cacheKey, where parts of the cacheKey hash are memoized
                                                                                                                                                                 */function childContext(path, context) {var settings = context.settings,parserOptions = context.parserOptions,parserPath = context.parserPath,languageOptions = context.languageOptions;if (JSON.stringify(settings) !== prevSettings) {
    settingsHash = (0, _hash.hashObject)({ settings: settings }).digest('hex');
    prevSettings = JSON.stringify(settings);
  }

  if (JSON.stringify(parserOptions) !== prevParserOptions) {
    parserOptionsHash = (0, _hash.hashObject)({ parserOptions: parserOptions }).digest('hex');
    prevParserOptions = JSON.stringify(parserOptions);
  }

  return {
    cacheKey: String(parserPath) + parserOptionsHash + settingsHash + String(path),
    settings: settings,
    parserOptions: parserOptions,
    parserPath: parserPath,
    path: path,
    languageOptions: languageOptions };

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHBvcnRNYXAvY2hpbGRDb250ZXh0LmpzIl0sIm5hbWVzIjpbImNoaWxkQ29udGV4dCIsInBhcnNlck9wdGlvbnNIYXNoIiwicHJldlBhcnNlck9wdGlvbnMiLCJzZXR0aW5nc0hhc2giLCJwcmV2U2V0dGluZ3MiLCJwYXRoIiwiY29udGV4dCIsInNldHRpbmdzIiwicGFyc2VyT3B0aW9ucyIsInBhcnNlclBhdGgiLCJsYW5ndWFnZU9wdGlvbnMiLCJKU09OIiwic3RyaW5naWZ5IiwiZGlnZXN0IiwiY2FjaGVLZXkiLCJTdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBV3dCQSxZLENBWHhCLGdEQUVBLElBQUlDLG9CQUFvQixFQUF4QixDQUNBLElBQUlDLG9CQUFvQixFQUF4QixDQUNBLElBQUlDLGVBQWUsRUFBbkIsQ0FDQSxJQUFJQyxlQUFlLEVBQW5CLEMsQ0FFQTs7O21LQUllLFNBQVNKLFlBQVQsQ0FBc0JLLElBQXRCLEVBQTRCQyxPQUE1QixFQUFxQyxLQUMxQ0MsUUFEMEMsR0FDZUQsT0FEZixDQUMxQ0MsUUFEMEMsQ0FDaENDLGFBRGdDLEdBQ2VGLE9BRGYsQ0FDaENFLGFBRGdDLENBQ2pCQyxVQURpQixHQUNlSCxPQURmLENBQ2pCRyxVQURpQixDQUNMQyxlQURLLEdBQ2VKLE9BRGYsQ0FDTEksZUFESyxDQUdsRCxJQUFJQyxLQUFLQyxTQUFMLENBQWVMLFFBQWYsTUFBNkJILFlBQWpDLEVBQStDO0FBQzdDRCxtQkFBZSxzQkFBVyxFQUFFSSxrQkFBRixFQUFYLEVBQXlCTSxNQUF6QixDQUFnQyxLQUFoQyxDQUFmO0FBQ0FULG1CQUFlTyxLQUFLQyxTQUFMLENBQWVMLFFBQWYsQ0FBZjtBQUNEOztBQUVELE1BQUlJLEtBQUtDLFNBQUwsQ0FBZUosYUFBZixNQUFrQ04saUJBQXRDLEVBQXlEO0FBQ3ZERCx3QkFBb0Isc0JBQVcsRUFBRU8sNEJBQUYsRUFBWCxFQUE4QkssTUFBOUIsQ0FBcUMsS0FBckMsQ0FBcEI7QUFDQVgsd0JBQW9CUyxLQUFLQyxTQUFMLENBQWVKLGFBQWYsQ0FBcEI7QUFDRDs7QUFFRCxTQUFPO0FBQ0xNLGNBQVVDLE9BQU9OLFVBQVAsSUFBcUJSLGlCQUFyQixHQUF5Q0UsWUFBekMsR0FBd0RZLE9BQU9WLElBQVAsQ0FEN0Q7QUFFTEUsc0JBRks7QUFHTEMsZ0NBSEs7QUFJTEMsMEJBSks7QUFLTEosY0FMSztBQU1MSyxvQ0FOSyxFQUFQOztBQVFEIiwiZmlsZSI6ImNoaWxkQ29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGhhc2hPYmplY3QgfSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL2hhc2gnO1xuXG5sZXQgcGFyc2VyT3B0aW9uc0hhc2ggPSAnJztcbmxldCBwcmV2UGFyc2VyT3B0aW9ucyA9ICcnO1xubGV0IHNldHRpbmdzSGFzaCA9ICcnO1xubGV0IHByZXZTZXR0aW5ncyA9ICcnO1xuXG4vKipcbiAqIGRvbid0IGhvbGQgZnVsbCBjb250ZXh0IG9iamVjdCBpbiBtZW1vcnksIGp1c3QgZ3JhYiB3aGF0IHdlIG5lZWQuXG4gKiBhbHNvIGNhbGN1bGF0ZSBhIGNhY2hlS2V5LCB3aGVyZSBwYXJ0cyBvZiB0aGUgY2FjaGVLZXkgaGFzaCBhcmUgbWVtb2l6ZWRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2hpbGRDb250ZXh0KHBhdGgsIGNvbnRleHQpIHtcbiAgY29uc3QgeyBzZXR0aW5ncywgcGFyc2VyT3B0aW9ucywgcGFyc2VyUGF0aCwgbGFuZ3VhZ2VPcHRpb25zIH0gPSBjb250ZXh0O1xuXG4gIGlmIChKU09OLnN0cmluZ2lmeShzZXR0aW5ncykgIT09IHByZXZTZXR0aW5ncykge1xuICAgIHNldHRpbmdzSGFzaCA9IGhhc2hPYmplY3QoeyBzZXR0aW5ncyB9KS5kaWdlc3QoJ2hleCcpO1xuICAgIHByZXZTZXR0aW5ncyA9IEpTT04uc3RyaW5naWZ5KHNldHRpbmdzKTtcbiAgfVxuXG4gIGlmIChKU09OLnN0cmluZ2lmeShwYXJzZXJPcHRpb25zKSAhPT0gcHJldlBhcnNlck9wdGlvbnMpIHtcbiAgICBwYXJzZXJPcHRpb25zSGFzaCA9IGhhc2hPYmplY3QoeyBwYXJzZXJPcHRpb25zIH0pLmRpZ2VzdCgnaGV4Jyk7XG4gICAgcHJldlBhcnNlck9wdGlvbnMgPSBKU09OLnN0cmluZ2lmeShwYXJzZXJPcHRpb25zKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2FjaGVLZXk6IFN0cmluZyhwYXJzZXJQYXRoKSArIHBhcnNlck9wdGlvbnNIYXNoICsgc2V0dGluZ3NIYXNoICsgU3RyaW5nKHBhdGgpLFxuICAgIHNldHRpbmdzLFxuICAgIHBhcnNlck9wdGlvbnMsXG4gICAgcGFyc2VyUGF0aCxcbiAgICBwYXRoLFxuICAgIGxhbmd1YWdlT3B0aW9ucyxcbiAgfTtcbn1cbiJdfQ==