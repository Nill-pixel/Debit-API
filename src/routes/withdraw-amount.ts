import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { stripClient } from "../util/stripe-validation";
import { BadRequest } from "./_errors/bad-request";

export const withdrawAmount = async (app: FastifyInstance) => {
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
            message: z.string()
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
          balance: true
        }
      })

      if (!creditCard) {
        throw new BadRequest('Invalid number Credit Card')
      }
      if (creditCard.cvv !== cvv) {
        throw new BadRequest('Invalid CVV Credit Card')
      }
      if (creditCard.month !== month) {
        throw new BadRequest('Invalid Month Credit Card')
      }
      if (creditCard.year !== year) {
        throw new BadRequest('Invalid Year Credit Card')
      }

      if (creditCard.balance < amount) {
        throw new BadRequest('Not amount enough!')
      }

      try {
        const stripe = await stripClient.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          payment_method_types: ['card']
        })
      } catch (err) {
        reply.code(500).send({ message: 'Failed to process payment' })
      }

      const withdraw = await prisma.creditCard.update({
        where: {
          number
        },
        data: {
          balance: {
            decrement: amount
          }
        }
      })

      reply.status(201).send({
        message: `Your withdrawal of ${amount} has been processed. Your current balance is ${withdraw.balance}.`
      })
    })

}