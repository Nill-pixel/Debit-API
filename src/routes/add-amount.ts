import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import Stripe from "stripe";
import z from "zod";
import { prisma } from "../lib/prisma";
import { stripClient } from "../util/stripe-validation";
import { BadRequest } from "./_errors/bad-request";

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
            message: z.string()
          })

        }
      }
    }, async (request, reply) => {
      const { number, cvv, month, year, amount } = request.body

      try {
        const stripe = await stripClient.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          payment_method_types: ['card']
        })
      } catch (err) {
        reply.code(500).send({ message: 'Failed to process payment' })
      }

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

      const recharge = await prisma.creditCard.update({
        where: {
          number
        },
        data: {
          balance: {
            increment: amount
          }
        }
      })

      reply.status(201).send({
        message: `Your deposit has been successfully credited to your account. $${recharge.balance}`
      })

    })
}