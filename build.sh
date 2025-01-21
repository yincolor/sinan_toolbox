cd ./svfs/
rm svfs.bin 
rm svfs_metadata.json
bun run ./mk_svfs.js
cd ..

mkdir build

bun build ./index.js ./sys.js ./exec_command.js ./window.js ./webview/lib/* --compile --outfile ./build/sinan_toolbox
