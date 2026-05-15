import { ApolloServer } from "apollo-server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFileSync } from "fs";
import path from "path";
import { createA11yPlugin } from "../a11y/plugin";

const ROOT = process.cwd();

const moviesData = JSON.parse(
  readFileSync(path.join(ROOT, "demo", "movies.fixture.json"), "utf8"),
) as Array<{
  id: string;
  title: string;
  releaseYear: number;
  rating: number;
}>;

const { a11yRoot, A11y, A11yTemplates } = createA11yPlugin();

const resolvers = {
  Query: { movies: () => moviesData },
  Movie: { a11y: a11yRoot },
  A11y,
  A11yTemplates,
};

async function main() {
  const typeDefs = readFileSync(path.join(ROOT, "demo", "schema.graphql"), "utf8");
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const server = new ApolloServer({ schema, introspection: true });
  const { url } = await server.listen({ port: 4003 });

  console.log(`GraphQL a11y demo running at ${url}`);
  console.log(`
Try these queries:

# Query A: name + description source fields
query {
  movies {
    title
    rating
    releaseYear
    a11y {
      label
      role
      tokens { type value }
      templates { summary }
    }
  }
}

# Query B: only title
query {
  movies {
    title
    a11y {
      label
      role
      templates { summary }
    }
  }
}

What to point out:
- label comes from @a11yLabel(field: "title")
- role comes from @a11yRole(role: GROUP)
- summary comes from @a11yTemplate(summary: "{title}{rating}{year}.")
  — only queried fields contribute; "rated" and "; released in" live on the
    rating/year tokens so they disappear when those fields are not selected
- tokens/summary are still selection-aware
  `);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
