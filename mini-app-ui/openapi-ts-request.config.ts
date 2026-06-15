import { defineConfig } from 'openapi-ts-request'

export default defineConfig([
  {
    describe: 'language-learning-openapi',
    schemaPath: process.env.OPENAPI_SCHEMA_URL || 'http://localhost:3000/api/openapi.json',
    serversPath: './src/service',
    requestLibPath: `import request from '@/http/vue-query';\n import { CustomRequestOptions_ } from '@/http/types';`,
    requestOptionsType: 'CustomRequestOptions_',
    isGenReactQuery: false,
    reactQueryMode: 'vue',
    isGenJavaScript: false,
  },
])
