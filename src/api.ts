import * as path from 'path';
import { renderFile } from 'ejs';
import { OpenAPI2SchemaObject } from '@manifoldco/swagger-to-ts/dist-types/types';
interface OpenAPI2ParamObject {
  in: 'body' | 'path' | 'query';
  name: string;
  description: string;
  required: boolean;
  schema: OpenAPI2SchemaObject;
}
export interface OpenAPI2PathObject {
  summary: string;
  operationId: string;
  parameters?: OpenAPI2ParamObject[];
  responses: {
    '200': {
      description: string;
      schema: OpenAPI2SchemaObject;
      deprecated: boolean;
    };
  };
}

export interface OpenAPI2 {
  paths?: { [path: string]: { [method: string]: OpenAPI2PathObject } };
  swagger: string;
  [key: string]: any; // handle other properties beyond swagger-to-ts’ concern
}

export function main(
  swagger: string,
  template: string = '../template/template.ejs',
  typing: string = './typing.ts'
) {
  typing = path.resolve(process.cwd(), typing);
  const apijson = JSON.parse(swagger);
  if (!apijson.paths) throw new Error('no paths');
  const nodes: [string, string, OpenAPI2PathObject][] = [];
  Object.keys(apijson.paths).forEach((p) => {
    Object.keys(apijson.paths[p]).forEach((m) => {
      nodes.push([m, p, apijson.paths[p][m]]);
    });
  });
  return Promise.all(
    nodes.map((n) => {
      const obj = traverse(n[0], n[1], n[2]);
      if (!obj) return Promise.resolve('');
      return renderFile(path.resolve(__dirname, template), obj);
    })
  ).then((res) => {
    return [`import { definitions } from '${typing.replace('.ts', '')}';`].concat(res).join('\n');
  });
}

/**
 * @return fetch(param, query, data)
 * @param path
 * @param obj
 */
function traverse(method: string, p: string, obj: OpenAPI2PathObject) {
  let outPath = p;
  if (!obj.parameters) return;
  const pathParams = obj.parameters.filter((el) => el.in === 'path');
  pathParams.forEach(
    (el) => (outPath = outPath.replace('{' + el.name + '}', '${param.' + el.name + '}'))
  );
  const query = obj.parameters.filter((el) => el.in === 'query');
  outPath +=
    query.length > 0
      ? '?' + query.map((el) => el.name + '=${query.' + el.name + '}').join('&')
      : '';
  const outDataType = recursive(obj.parameters.find((el) => el.in === 'body')?.schema);
  return {
    operationId: obj.operationId,
    pathParams,
    query,
    method,
    path: outPath,
    dataCode: outDataType,
  };
}

function recursive(oo?: OpenAPI2SchemaObject) {
  if (!oo) return 'undefined';
  if (oo.$ref) {
    const refPath = (oo.$ref as string).split('/');
    const t = refPath.reduce((am, val, idx) => {
      if (idx === 1) return val;
      return (am += `['` + val + `']`);
    });
    return t;
  }
}
