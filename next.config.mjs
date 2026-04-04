const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    output: 'export',
    distDir: 'dist',
    basePath: isProd ? '/pikachu' : '',
    assetPrefix: isProd ? '/pikachu/' : '',
};

export default nextConfig;
