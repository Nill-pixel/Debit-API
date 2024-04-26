import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export const getCard = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/card/:cardId', {
      schema: {
        summary: 'Get an Card',
        tags: ['cards'],
        params: z.object({
          cardId: z.string().uuid()
        }),
        response: {
          200: z.object({
            card: z.object({
              id: z.string().uuid(),
              name: z.string(),
            })
          })
        }
      }
    }, async (request, reply) => {
      const { cardId } = request.params

      const card = await prisma.creditCard.findUnique({
        select: {
          name: true,
          number: true
        },
        where: {
          cardId
        }
      })

      return reply.send({
        card: {
          id: cardId,
          name: ""
        }
      })
    }
    )
}