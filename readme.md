## introduction
use @manifoldco/swagger-to-ts to generate typescript definition file and relevant api file

## usage
```bash
  swagger to ts api

  Usage
    $ swagger-to-ts-api [input] [options]

  Options
    --help                display this
    --rename              rename json file, ture
    --output, -o          specify output file
    --prettier-config     (optional) specify path to Prettier config file
    --template, -t        (optional) specify template file
    --output-api          specify output api file
```
## template.ejs
```ejs
export function <%= operationId %>(
<% if (pathParams.length > 0) {%>
  param: {
<% for (let el of pathParams){ %>
  <%=el.name%>: string;
<%} %>
  }
<% } %>
<% if (query.length > 0) {%>
  <%=pathParams.length > 0? ',': ''%>
  query: {<% for (let el of query){ %>
    <%=el.name%><%=el.required?'':'?'%>: string;
<%} %>
  }
<% } %>
<% if (dataCode !== 'undefined') {%>
  <%=pathParams.length > 0 ||query.length > 0 ? ',': ''%>
  data: <%-dataCode%>
<% } %>
){
  console.log(`<%-path%>`, <%=dataCode !== 'undefined'? 'data,': ''%>'<%=method%>')
}
```