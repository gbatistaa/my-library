const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// reanimated-color-picker ships its react-native field pointing to raw TS source
// which Metro can't transform. Force it to use the pre-built commonjs bundle instead.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'reanimated-color-picker') {
    return {
      filePath: path.resolve(
        __dirname,
        'node_modules/reanimated-color-picker/lib/commonjs/index.js'
      ),
      type: 'sourceFile',
    };
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
