import fastify from "fastify";
import { createCard } from "./routes/create-card";
import { getCard } from "./routes/get-card";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { addAmount } from "./routes/add-amount";
import { widrawAmount } from "./routes/widraw-amount";

const app = fastify()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(getCard)
app.register(createCard)
app.register(addAmount)
app.register(widrawAmount)

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log("HTTP server running at http://localhost:3333")
})
