import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const illegalReg = /[^a-zA-Z0-9\_\-]/g;

function rename( str: string) {
  return str.replace(illegalReg, '$');
}

function isIllegal( str: string) {
  return illegalReg.test(str);
}


export function main( filePath:string ) {
  let jsonText = readFileSync(resolve(process.cwd(), filePath), 'utf-8');
  const json = JSON.parse(jsonText);
  if (!json.definitions) {
    throw new Error('no definitions');
  }
  // replace illegal name
  // collect all illegal name
  const names:string[] = Object.keys(json.definitions).filter(el=>isIllegal(el));
  console.log(names, ' will be renamed');
  names.forEach(el => {
    jsonText = jsonText.replace(new RegExp(el, 'g'), rename(el));
  })

  writeFileSync(resolve(process.cwd(), filePath), jsonText);

}

