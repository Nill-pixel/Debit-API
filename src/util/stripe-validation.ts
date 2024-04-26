import Stripe from "stripe";

export const stripClient = new Stripe(process.env.STRIP_SECRET as string)