import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import Stripe from "stripe";
import z from "zod";
import { prisma } from "../lib/prisma";

const stripClient = new Stripe(process.env.STRIP_SECRET as string)
export const addAmount = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post("/recharge", {
      schema: {
        summary: 'Recharge the card',
        tags: ['recharge'],
        body: z.object({
          number: z.string(),
          cvv: z.number().int().positive(),
          month: z.number().int().positive(),
          year: z.number().int().positive(),
          amount: z.number().positive(),
        }),
        response: {
          201: z.object({
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
          year: true
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

      const recharge = await prisma.creditCard.update({
        where: {
          number
        },
        data: {
          amount: {
            increment: amount
          }
        }
      })

      reply.status(201).send({
        amount: recharge.amount
      })

    })
}