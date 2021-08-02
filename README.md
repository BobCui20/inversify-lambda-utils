# Inversify Lambda Utils
To provide IoC & DI for Lambda Applications.

## Usage

### Create a Lambda Function Collection

```typescript
@lambda()
export class GetUserLambda extends BaseLambda {

    @handler('TestHandler')
    async handle(context: ILambdaContext<SomeBodyType>): Promise<ApiGatewayResponse> {
        return {
            statusCode: 200,
            body: JSON.stringify({ Hello: 'World' }),
            headers: {}
        };
    }

}
```

### Generate the Lambda Handlers

`(index.ts)`
```typescript
// You have to import reflect-metadata as first import statement
import 'reflect-metadata';
// Remember to import the lambda class once to get it registered in the Reflect
import { GetUserLambda } from './get-user-lambda';
// ... some other imports

container = new Container();

const lambdaManager = new LambdaManager(container);

export = lambdaManager.build();
```

To Run Your Lambda Locally: `tsc && lambda-local -l dist/index.js -h TestHandler -e sample-events/empty.json`