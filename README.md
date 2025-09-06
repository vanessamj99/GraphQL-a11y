# GraphQL Accessibility Plugin

Selection-aware accessibility metadata for GraphQL using schema directives.

## Try the Demo

1. **Install and run**:
   ```bash
   npm install
   cd demo && npm install && npm run dev
   ```

2. **Open GraphQL Playground**: `http://localhost:4003/graphql`

3. **Try these queries**:

   **Query A - Title + Year**:
   ```graphql
   query {
     movies {
       title
       releaseYear
       a11y {
         label
         tokens { type value }
         templates { summary }
       }
     }
   }
   ```

   **Query B - Title + Rating**:
   ```graphql
   query {
     movies {
       title
       rating
       a11y {
         label
         tokens { type value }
         templates { summary }
       }
     }
   }
   ```

   **Query C - All Fields**:
   ```graphql
   query {
     movies {
       title
       releaseYear
       rating
       a11y {
         label
         tokens { type value }
         templates { summary }
       }
     }
   }
   ```

Notice how the `summary` changes based on what you query! The accessibility metadata is selection-aware.

## Use with Your Data

1. **Copy the plugin**:
   ```bash
   cp -r a11y ./your-project/src/
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   
   Make sure your project has `graphql` and `@graphql-tools/schema` in package.json.

3. **Add to your schema**:
   ```graphql
   directive @a11yLabel(field: String!) on OBJECT | FIELD_DEFINITION
   directive @a11yToken(
     type: String!
     field: String!
     priority: Int = 0
     label: String
     labelPosition: String
     unitPrefix: String
     unitSuffix: String
     number: Boolean
   ) on FIELD_DEFINITION
   directive @a11yTemplate(summary: String) on OBJECT

   type YourType @a11yTemplate(summary: "{name}, {price}") {
     name: String! @a11yLabel(field: "name") @a11yToken(type: "name", field: "name", priority: 0)
     price: Float @a11yToken(type: "price", field: "price", priority: 1, unitPrefix: "$", number: true)
     a11y: A11y!
   }

   type A11y {
     label: String!
     tokens: [A11yToken!]!
     templates: A11yTemplates
   }
   type A11yToken { type: String!, value: String!, priority: Int! }
   type A11yTemplates { summary: String }
   ```

4. **Set up resolvers**:
   ```typescript
   import { createA11yPlugin } from './a11y/plugin';
   
   const { a11yRoot, A11y, A11yTemplates } = createA11yPlugin();
   
   const resolvers = {
     YourType: { a11y: a11yRoot },
     A11y,
     A11yTemplates
   };
   ```

## How It Works

- Use `@a11yToken` to mark fields that contribute to accessibility data
- Use `@a11yTemplate` to define summary templates with placeholders like `{name}`, `{price}`
- Only queried fields appear in the tokens and summaries
- Empty placeholders are automatically filtered out