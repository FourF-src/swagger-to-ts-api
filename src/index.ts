import meow from 'meow';
import * as fs from 'fs';
import * as path from 'path';
import { main } from './api';
import { execSync } from 'child_process';
const cli = meow(
  `Usage
  $ swagger-to-ts-api [input] [options]

Options
  --help                display this
  --output, -o          specify output file
  --prettier-config     (optional) specify path to Prettier config file
  --template, -t        (optional) specify template file
  --output-api          specify output api file
`,
  {
    flags: {
      output: {
        type: 'string',
        alias: 'o',
      },
      outputApi: {
        type: 'string',
      },
      template: {
        type: 'string',
        alias: 't',
      },
      prettierConfig: {
        type: 'string',
      },
    },
  }
);

console.info('generate api ts file using swagger file');
const pathToSpec = cli.input[0];
const timeStart = process.hrtime();

(async () => {
  // exec swagger-to-ts
  const cmd =     'npx @manifoldco/swagger-to-ts' +
  ` ${pathToSpec} ${cli.flags.output?'--output '+cli.flags.output:''} ${cli.flags.prettierConfig?'----prettier-config '+ cli.flags.prettierConfig:''}`;
  console.info(cmd);
  const stdout = execSync(cmd);
  console.info(stdout.toString());

  let spec = '';
  try {
    spec = fs.readFileSync(path.resolve(process.cwd(), pathToSpec), 'utf-8');
  } catch (e) {
    console.error(`❌ to api: "${e}"`);
  }
  if (!cli.flags.output) {
    console.warn(`ℹ️ to api need typing file`);
  }


  const result = await main(spec, cli.flags.template, cli.flags.output);
  // Write to file if specifying output
  if (cli.flags.outputApi) {
    const outputFile = path.resolve(process.cwd(), cli.flags.outputApi);

    // recursively create parent directories if they don’t exist
    const parentDirs = cli.flags.outputApi.split(path.sep);
    for (var i = 1; i < parentDirs.length; i++) {
      const dir = path.resolve(process.cwd(), ...parentDirs.slice(0, i));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    }

    fs.writeFileSync(outputFile, result, 'utf8');

    const timeEnd = process.hrtime(timeStart);
    const time = timeEnd[0] + Math.round(timeEnd[1] / 1e6);
    console.log(`🚀 ${cli.input[0]} -> ${(cli.flags.outputApi)} [${time}ms]`);
    return;
  }

  // Otherwise, return result
  return result;
})();
