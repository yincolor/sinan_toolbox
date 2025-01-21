
/**
 * 执行命令行
 * @param {string} command 
 * @param {Function} stdoutCallback 
 * @param {Function} stderrCallback 
 */
export async function execCommand(command, stdoutCallback, stderrCallback){
    const commandList = command.split(' ');
    // console.log(commandList);
    
    const proc = Bun.spawn(commandList, {
        stdout:'pipe', 
        stderr:'pipe'
    }); 
    const stdoutReader = proc.stdout.getReader();
    const stderrReader = proc.stderr.getReader();
    await Promise.all([readStream(stdoutReader, stdoutCallback), readStream(stderrReader, stderrCallback)]); 
    return true; 
}

/**
 * 
 * @param {ReadableStreamDefaultReader} reader 
 * @param {Function} callback 
 */
async function readStream(reader, callback) {
    const decoder = new TextDecoder(); 
    while (true) {
        const {done, value} = await reader.read();
        const str = decoder.decode(value);
        callback(str);
        if(done){
            break; 
        }
    }
}