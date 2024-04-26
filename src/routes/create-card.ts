import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { generateVisaCreditCardNumber } from "../util/generate-number";
import { generateExpirationDate } from "../util/generate-expiration-date";
import { stripClient } from "../util/stripe-validation";

export const createCard = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post("/create", {
      schema: {
        summary: 'Create a new card',
        tags: ['cards'],
        body: z.object({
          name: z.string().min(6),
          cvv: z.number().positive().int(),
          amount: z.number()
        }),
        response: {
          201: z.object({
            message: z.string().uuid()
          })
        }
      }
    },
      async (request, reply) => {
        const { name, cvv, amount } = request.body
        const number = generateVisaCreditCardNumber()
        const expirationDate = generateExpirationDate()
        const month = expirationDate.getMonth()
        const year = expirationDate.getFullYear()

        try {
          const stripe = await stripClient.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card']
          })
        } catch (err) {
          reply.code(500).send({ message: 'Failed to process payment' })
        }

        const card = await prisma.creditCard.create({
          data: { name, expirationDate, number, balance: amount, cvv, month, year }
        })

        return reply.status(201).send({
          message: `Your card has been successfully created. Your current balance is ${card.balance}.`
        })
      })
}