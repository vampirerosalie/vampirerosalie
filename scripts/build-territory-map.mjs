import {build} from 'vite';
await build({configFile:false,publicDir:false,logLevel:'warn',build:{outDir:'public/battle13',emptyOutDir:false,lib:{entry:'app/battle13/client/kingdom.js',formats:['es'],fileName:()=> 'kingdom.bundle.js'},minify:'esbuild',rollupOptions:{output:{inlineDynamicImports:true}}}});
console.log('Built self-hosted Territory Wars 3D renderer.');
