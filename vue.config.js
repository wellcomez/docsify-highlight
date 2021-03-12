module.exports = {
    productionSourceMap: false,
    css: {
        extract: true, // 是否使用css分离插件 ExtractTextPlugin
        sourceMap: false, // 开启 CSS source maps?
        loaderOptions: {
            less: {
                javascriptEnabled: true //less 配置
            }
        }, // css预设器配置项
        requireModuleExtension: false // 启用 CSS modules for all css / pre-processor files.
    },
}