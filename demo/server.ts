import { ApolloServer } from "apollo-server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFileSync } from "fs";
import { join } from "path";
import { createA11yPlugin } from "../a11y/plugin";

const moviesData = JSON.parse(
  readFileSync(join(__dirname, "movies.fixture.json"), "utf8"),
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
  const typeDefs = readFileSync(join(__dirname, "schema.graphql"), "utf8");
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
- summary comes from @a11yTemplate(summary: "{title}, {rating}, {year}.")
- tokens/summary are selection-aware
  `);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
