import { ApolloServer } from "apollo-server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFileSync } from "fs";
import { join } from "path";
import { createA11yPlugin } from "../a11y/plugin";

const moviesData = [
  { id: "1", title: "Inception",       releaseYear: 2010, rating: 8.8 },
  { id: "2", title: "The Dark Knight", releaseYear: 2008, rating: 9.0 },
  { id: "3", title: "Interstellar",    releaseYear: 2014, rating: 8.6 },
];

const { a11yRoot, A11y, A11yTemplates } = createA11yPlugin();

const resolvers = {
  Query: { movies: () => moviesData },
  Movie: { a11y: a11yRoot },
  A11y,
  A11yTemplates,
};

async function main() {
  const typeDefs = readFileSync(join(__dirname, "schema.graphql"), "utf-8");
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const server = new ApolloServer({ schema, introspection: true });
  const { url } = await server.listen({ port: 4003 });
  console.log(`🚀 Movie Cards Demo running at ${url}`);
  console.log(`
Try these queries to see selection-aware accessibility:

# Card A: title + releaseYear
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

# Card B: title + rating
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

# Card C: only label (tokens/summary never computed)
query {
  movies {
    title
    a11y { label }
  }
}

Notice: Card A includes YEAR tokens and "Inception, 2010 year" summary, Card B includes RATING tokens and "Inception, 8.8/10 rating" summary!

The accessibility metadata is now read from GraphQL directives in the schema, making it truly schema-embedded!
  `);
}
main().catch(console.error); 