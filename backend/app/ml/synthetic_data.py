"""Synthetic complaint generator. ALL data here is synthetic and template-based.

Every sample carries a `group` (its source template). Train/test splitting is done BY TEMPLATE so that
near-duplicate wordings never leak across the split. Metrics on this data do NOT measure real-world accuracy.
"""
import random
from ..enums import Cat

T = {
    Cat.FAILED: [
        "My payment of Rs {amt} to {m} failed but the money was debited from my account.",
        "UPI transaction failed and amount got deducted, not reversed yet.",
        "Payment showed failure on the app, still money cut from my bank.",
        "The transaction was declined at {m} but {amt} rupees left my account.",
        "Money debited and payment failed. Please check why the amount has not come back.",
        "I got a payment failed message yet my balance reduced by {amt}.",
        "Transfer to {m} unsuccessful, bank account debited anyway.",
        "Transaction failed due to a technical error but my account was charged.",
    ],
    Cat.DUPLICATE: [
        "The same payment of Rs {amt} was deducted twice for one order.",
        "I was charged two times for a single transaction to {m}.",
        "Double debit happened, {amt} was taken twice from my account.",
        "Duplicate payment: money went out twice within a minute.",
        "Same amount debited two times, I only paid once at {m}.",
        "My account shows two identical debits for {m}, I clicked pay only once.",
        "Paid once but got two deductions of {amt}.",
        "Payment was cut twice, need one of them returned.",
    ],
    Cat.UNAUTHORIZED: [
        "I did not make this payment of Rs {amt}, I don't know {m}.",
        "Someone made an unauthorized transaction from my account.",
        "There is a debit in my account that I never approved or initiated.",
        "Fraud: money sent to {m} without my knowledge.",
        "My phone was stolen and payments were made that were not mine.",
        "I clicked a suspicious link and now Rs {amt} is gone, I did not authorize it.",
        "Unknown person withdrew {amt} through UPI from my account.",
        "This transaction is not mine. I never shared my PIN or OTP with anyone.",
    ],
    Cat.AMOUNT: [
        "I was charged Rs {amt} but the bill was much less.",
        "Wrong amount debited, I agreed to pay less than what was taken at {m}.",
        "The merchant took more money than the price shown.",
        "I entered {amt} but a higher amount was deducted.",
        "Incorrect amount charged for my order at {m}, extra money was taken.",
        "Overcharged by the merchant, the debit does not match my invoice.",
        "Amount deducted is different from the amount I authorised.",
        "Paid for a small item but a bigger sum got debited.",
    ],
    Cat.NON_DELIVERY: [
        "I paid Rs {amt} to {m} but the order was never delivered.",
        "Paid for the product, nothing arrived and the seller is not responding.",
        "Merchant took my money and did not ship the item.",
        "Package not received though payment was successful at {m}.",
        "Order status is stuck and the goods were not delivered after payment.",
        "The seller blocked me after I paid and I never got the product.",
        "It has been three weeks since I paid {m} and there is no delivery.",
        "Service not provided after payment, merchant says nothing.",
    ],
    Cat.REFUND: [
        "The merchant approved my refund of {amt} but I have not received it.",
        "Order cancelled at {m} and the refund is still pending after many days.",
        "Refund was promised in 5 days but nothing has come to my account.",
        "I returned the item and the refund has not been credited.",
        "Cancelled my order and the money has not come back yet.",
        "Waiting for the refund from {m} for two weeks.",
        "Refund initiated by seller but it is not showing in my bank.",
        "Still not got my refund after returning the product.",
    ],
    Cat.PENDING: [
        "My payment to {m} is stuck in pending status.",
        "Transaction pending since morning, status shows processing.",
        "UPI payment shows pending and I do not know if it went through.",
        "The payment status is awaiting confirmation for hours.",
        "Transaction is in progress for a long time, amount {amt}.",
        "App says pending, please tell me whether payment was completed.",
        "Payment status still processing, should I pay again?",
        "Pending transaction of {amt} not updated yet.",
    ],
    Cat.OTHER: [
        "How do I change my registered UPI ID?",
        "The app keeps crashing when I open it.",
        "I want to update my mobile number linked to the bank.",
        "Please explain the daily UPI transaction limit.",
        "How can I add a second bank account?",
        "My QR code is not scanning properly.",
        "I forgot how to set a new UPI PIN.",
        "Need a statement of my transactions for last month.",
    ],
}
PRE = ["", "Hi, ", "Please help. ", "Sir, ", "Hello team, ", "Urgent: "]
SUF = ["", " Please resolve.", " Need urgent help.", " Kindly check.", " Thank you."]
MERCH = ["QuickMart", "ShopEasy", "FoodHub", "TechBazaar", "CityCabs", "BookNook", "FreshGrocer"]


def generate(seed: int = 42, per_template: int = 12):
    rng = random.Random(seed)
    rows = []
    for cat, templates in T.items():
        for ti, tpl in enumerate(templates):
            seen = set()
            for _ in range(per_template * 4):
                text = rng.choice(PRE) + tpl.format(amt=rng.randint(50, 20000), m=rng.choice(MERCH)) + rng.choice(SUF)
                if text not in seen:
                    seen.add(text)
                    rows.append({"text": text, "label": cat, "group": f"{cat}:{ti}"})
                if len(seen) >= per_template:
                    break
    return rows


def split_by_template(rows, seed: int = 42, test_templates_per_class: int = 1):
    rng = random.Random(seed)
    test_groups = set()
    for cat, templates in T.items():
        idx = list(range(len(templates)))
        rng.shuffle(idx)
        test_groups |= {f"{cat}:{i}" for i in idx[:test_templates_per_class]}
    train = [r for r in rows if r["group"] not in test_groups]
    test = [r for r in rows if r["group"] in test_groups]
    return train, test
