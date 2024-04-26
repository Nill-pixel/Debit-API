import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export const widrawAmount = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/widraw', {
      schema: {
        summary: 'Widraw amount from the card',
        tags: ['widraw'],
        body: z.object({
          number: z.string(),
          cvv: z.number().int().positive(),
          month: z.number().int().positive(),
          year: z.number().int().positive(),
          amount: z.number().positive(),
        }), response: {
          200: z.object({
            amount: z.number().positive()
          })
        }
      }
    }, async (request, reply) => {
      const { number, cvv, month, year, amount } = request.body

      const creditCard = await prisma.creditCard.findUnique({
        where: {
          number,
        },
        select: {
          cvv: true,
          month: true,
          year: true,
          amount: true
        }
      })

      if (!creditCard) {
        throw new Error('Invalid number Credit Card')
      }
      if (creditCard.cvv !== cvv) {
        throw new Error('Invalid CVV Credit Card')
      }
      if (creditCard.month !== month) {
        throw new Error('Invalid Month Credit Card')
      }
      if (creditCard.year !== year) {
        throw new Error('Invalid Year Credit Card')
      }

      if (creditCard.amount < amount) {
        throw new Error('Not amount enough!')
      }

      const widraw = await prisma.creditCard.update({
        where: {
          number
        },
        data: {
          amount: {
            decrement: amount
          }
        }
      })

      reply.status(201).send({
        amount: widraw.amount
      })
    })

}