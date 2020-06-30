import { Project } from "ts-morph";

const illegalReg = /[^a-zA-Z0-9\_\-]/g;

function removeQuato(str: string) {
  return str.replace(/^'|"/, '').replace(/'|"$/, '')
}

function rename( str: string) {
  return str.replace(illegalReg, '$');
}

function isIllegal( str: string) {
  return illegalReg.test(str);
}


export function main(filename:string){
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filename);
  // remove namespace
  const flag = 'definitions';
  const definitions = sourceFile.getInterface(flag);  

  const properities = definitions.getProperties();

  properities.forEach(p => {
    const name = removeQuato(p.getName());
    const newname = 'I' + isIllegal(name)? rename(name): name;
    sourceFile.addTypeAlias({
      name: newname,
      type: `${flag}['${name}']`,
      isExported: true
    })
  })

  sourceFile.saveSync();
}


