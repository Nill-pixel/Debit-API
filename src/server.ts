import fastify from "fastify";
import { createCard } from "./routes/create-card";
import { getCard } from "./routes/get-card";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { addAmount } from "./routes/add-amount";
import { withdrawAmount } from "./routes/withdraw-amount";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

const app = fastify()

app.register(fastifyCors, {
  origin: '*'
})

app.register(fastifySwagger, {
  swagger: {
    consumes: ['application/json'],
    produces: ['application/json'],
    info: {
      title: 'Debit API',
      description: 'A ideia em si é muito simples.Uma API que seja é possível realizar um checkout com o cartão de débito',
      version: '1.0.0'
    }
  },
  transform: jsonSchemaTransform
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(getCard)
app.register(createCard)
app.register(addAmount)
app.register(withdrawAmount)

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log("HTTP server running at http://localhost:3333")
})
