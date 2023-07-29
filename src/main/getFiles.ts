import {readdir,stat} from 'fs/promises'
import {join,resolve} from 'path'

export async function walk (dir:string,filelist:string[]=[]) {
    const list = await readdir(dir).catch((e)=>{throw e})
    if (!list) return;
    for (const file of list) {
        if (!file) continue;
        const path = resolve(dir, file);
        const metadata = await stat(path).catch((e)=>{console.log(e) });
        if (metadata && metadata.isDirectory()) {
            await walk(path)
          } else {
           
      
          }
        
    }

}