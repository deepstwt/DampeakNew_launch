/**
 * Policy and information pages.
 *
 * IMPORTANT — these are structured drafts, not legal advice. Every bracketed
 * [PLACEHOLDER] must be filled in, and the whole set must be reviewed by a
 * lawyer before launch. Dampeak sells to consumers, so the applicable regimes are
 * at least India's DPDP Act 2023 and the Consumer Protection (E-Commerce) Rules
 * 2020 — plus UK/EU GDPR the moment you ship there.
 *
 * While this is true, LEGAL_DRAFT below renders a visible notice on the pages.
 * Flip it to false once the review is done.
 */
export const LEGAL_DRAFT = true;

export const COMPANY = {
  legalName: "[Company legal name]",
  trading: "Dampeak",
  address: "[Registered address]",
  email: "hello@dampeak.com",
  supportEmail: "support@dampeak.com",
  privacyEmail: "privacy@dampeak.com",
  phone: "[Support phone]",
  gstin: "[GSTIN]",
  cin: "[CIN / registration number]",
  jurisdiction: "[City], India",
} as const;

export type Section = {
  heading: string;
  body?: string[];
  list?: string[];
};

export type Doc = {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  /** FAQ renders as native disclosure widgets instead of headed sections. */
  format?: "sections" | "faq";
  sections: Section[];
  /**
   * One way onward from the bottom of the page. Only the About page has one —
   * a policy document ending in a Buy button would be reading the room wrong.
   */
  cta?: { label: string; href: string };
};

export const DOCS: Doc[] = [
  {
    slug: "about",
    title: "About Dampeak",
    summary: "Made for Better Everyday.",
    updated: "August 2026",
    cta: { label: "Shop Dampeak", href: "/products" },
    sections: [
      {
        heading: "Made for everyday living.",
        body: [
          `${COMPANY.trading} started with a simple idea: the things we live with every day should make our daily lives better, more comfortable, relaxing, and fun.`,
          "We create products designed to bring a little more comfort, convenience, personality, and fun into everyday life.",
          "From something that makes you smile to something that makes a moment more comfortable to something that makes tasks easier, we look for ideas that have a place in the way people live.",
          `We work with production partners to bring our products to life, thoughtfully developing the details that make each one feel like ${COMPANY.trading}.`,
          "We're starting small, with a growing collection of products made for everyday moments. As we grow, we'll continue exploring new ideas, new ways of living, and new products that we think are worth bringing into your world.",
          "Because everyday living doesn't have to be ordinary.",
        ],
      },
      {
        heading: "Our one rule",
        body: [
          "If it doesn't make life easier, we don't make it.",
          "That sounds obvious. It isn't. Most things exist because they can be manufactured and sold, not because anyone needed them. So we kill far more ideas than we ship, and the test never changes: is an ordinary day actually better with this in it?",
        ],
      },
      {
        heading: "Four, and only four",
        body: [
          "We launch with four. Not four ranges with gaps in them, and not a catalogue padded out to look established — four squishies, each one different enough to be worth having.",
        ],
        list: [
          "Rounded Cube — smooth and minimal, big enough to need a whole hand.",
          "Toasted Bread — a pastel pillow square in matte foam, the softest of the four.",
          "Cheese Cube — moulded texture in bright yellow, with holes your fingers find on their own.",
          "Marbled Cube — smooth rounded cube, marbled so no two are alike.",
        ],
      },
      {
        heading: "How we choose",
        body: [
          "Shape, surface and give are the whole product. A squishy that is too firm gets put down; one that is too soft never comes back to shape. Everything on our spec sheet — the edge profile, the finish, the density — exists to get that one thing right.",
          "If an idea needs a new habit, an app or a subscription, it isn't the answer.",
        ],
      },
      {
        heading: "What we won't do",
        list: [
          "We don't make medical or therapeutic claims. These are made to be good to hold, not to treat anything. If something is wrong, please talk to a doctor.",
          "We don't write our own reviews, and we don't present stock or generated imagery as photographs of real customers.",
          "We don't launch a product because the season needs one.",
          "We don't add a feature to justify a higher price.",
        ],
      },
      {
        heading: "Where to buy",
        body: [
          "We sell through Amazon rather than running our own checkout, so payment, delivery and returns are handled somewhere you already trust rather than somewhere you have to take a chance on.",
        ],
      },
      {
        heading: "Company details",
        list: [
          `Registered name: ${COMPANY.legalName}`,
          `Trading as: ${COMPANY.trading}`,
          `Registered address: ${COMPANY.address}`,
          `Registration number: ${COMPANY.cin}`,
          `GSTIN: ${COMPANY.gstin}`,
          `Email: ${COMPANY.email}`,
        ],
      },
    ],
  },

  {
    slug: "privacy",
    title: "Privacy Policy",
    summary: "What we collect, why we collect it, and what you can ask us to do with it.",
    updated: "August 2026",
    sections: [
      {
        heading: "Who we are",
        body: [
          `${COMPANY.legalName} (“we”, “us”) is the data fiduciary and controller for the personal data described here. You can reach us at ${COMPANY.privacyEmail} or by post at ${COMPANY.address}.`,
        ],
      },
      {
        heading: "What we collect",
        list: [
          "Contact details you give us — name, email address, delivery address, phone number.",
          "Order information — what you bought, when, and the amount paid. We never see or store full card numbers; payments are handled by our payment provider.",
          "Messages you send us, including support requests and product reviews.",
          "Basic technical data — IP address, browser type and pages viewed, used to keep the site working and secure.",
        ],
      },
      {
        heading: "Why we use it",
        list: [
          "To take, fulfil and deliver your order, and to handle returns.",
          "To answer your questions and provide support.",
          "To send you email updates, but only where you have asked us to. Every email has an unsubscribe link.",
          "To detect and prevent fraud and abuse, and to meet our legal and tax obligations.",
        ],
      },
      {
        heading: "Our lawful basis",
        body: [
          "Where GDPR applies, we rely on: performance of a contract (to fulfil your order), consent (for marketing email), legitimate interests (site security and service improvement) and legal obligation (tax and accounting records).",
          "Where India's DPDP Act 2023 applies, we process personal data on the basis of the consent you give at the point of collection, or for the legitimate uses that Act permits.",
        ],
      },
      {
        heading: "Who we share it with",
        body: [
          "We do not sell your personal data. We share it only with the service providers we need to run the business — payment processing, delivery, email delivery and hosting — and only the minimum each one needs.",
          "We may disclose data where the law requires it, or to establish or defend legal claims.",
        ],
      },
      {
        heading: "Where it is stored",
        body: [
          "Our systems are hosted with providers who may process data outside your country. Where data leaves the UK or EEA, we rely on the appropriate safeguards required by law, such as Standard Contractual Clauses.",
        ],
      },
      {
        heading: "How long we keep it",
        list: [
          "Order and invoice records: kept for the period required by tax law — currently [X] years.",
          "Marketing contacts: until you unsubscribe, then removed from active lists.",
          "Support messages: [X] months after the matter is closed.",
          "Technical logs: [X] days.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask us to give you a copy of your data, correct it, delete it, restrict how we use it, or object to a particular use. You can withdraw consent to marketing at any time.",
          `To exercise any of these, email ${COMPANY.privacyEmail}. We will respond within the period the law allows. If you are unhappy with our response you can complain to your data protection regulator — in India, the Data Protection Board; in the UK, the ICO.`,
        ],
      },
      {
        heading: "Children",
        body: [
          "Our site is not directed at children, and we do not knowingly collect data from anyone under 18. If you believe a child has given us personal data, contact us and we will delete it.",
        ],
      },
      {
        heading: "Security",
        body: [
          "We use encryption in transit, access controls and hashed identifiers rather than raw IP addresses in our analytics. No system is perfectly secure, but we take reasonable technical and organisational measures to protect your data, and we will notify you and the regulator of a qualifying breach as the law requires.",
        ],
      },
      {
        heading: "Changes",
        body: [
          "If we change this policy we will update the date at the top of this page, and tell you directly where the change is significant.",
        ],
      },
    ],
  },

  {
    slug: "terms",
    title: "Terms of Sale",
    summary: "The agreement between you and us when you buy something.",
    updated: "August 2026",
    sections: [
      {
        heading: "These terms",
        body: [
          `By placing an order with ${COMPANY.legalName} you agree to these terms. Please read them before you buy. Nothing here affects your statutory rights as a consumer.`,
        ],
      },
      {
        heading: "Ordering",
        body: [
          "Your order is an offer to buy. A contract is formed only when we send you an email confirming the item has been dispatched.",
          "We may decline an order — for example if the item is out of stock, we cannot deliver to your address, or the price was listed in error.",
        ],
      },
      {
        heading: "Prices and payment",
        list: [
          "Prices are shown in Indian Rupees and include applicable taxes unless stated otherwise.",
          "Delivery charges are shown separately before you pay.",
          "Payment is taken at checkout through our payment provider. We do not store your card details.",
          "If a price is obviously wrong, we will contact you before dispatch rather than simply cancelling.",
        ],
      },
      {
        heading: "Delivery",
        body: [
          "Delivery times are estimates. Risk in the goods passes to you on delivery. See our Shipping page for current areas and timescales.",
        ],
      },
      {
        heading: "Cancellation and returns",
        body: [
          "You can cancel or return an order under the conditions set out on our Returns page. That page forms part of these terms.",
        ],
      },
      {
        heading: "Faulty goods",
        body: [
          "If an item is faulty, not as described, or unfit for purpose, you are entitled to a repair, replacement or refund under consumer law. Contact us and we will arrange it at our cost.",
        ],
      },
      {
        heading: "Acceptable use",
        list: [
          "Do not use the site unlawfully, or attempt to gain unauthorised access to it.",
          "Do not scrape, resell or reproduce our content, photography or branding without written permission.",
          "Reviews you submit must be your honest experience. We may remove content that is abusive, misleading or unlawful.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          `The ${COMPANY.trading} name, logo, product designs, photography and site content are owned by us or our licensors and may not be used without permission.`,
        ],
      },
      {
        heading: "Our liability",
        body: [
          "We do not exclude liability for death or personal injury caused by our negligence, for fraud, or for anything else that cannot lawfully be excluded.",
          "Otherwise, our liability for any order is limited to the amount you paid for it, and we are not liable for indirect or consequential loss.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          `These terms are governed by the laws of India, and the courts of ${COMPANY.jurisdiction} have jurisdiction. If you are a consumer resident elsewhere, you keep the protection of the mandatory laws of your country.`,
        ],
      },
    ],
  },

  {
    slug: "cookies",
    title: "Cookie Policy",
    summary: "What we store on your device, and what we don't.",
    updated: "August 2026",
    sections: [
      {
        heading: "What cookies are",
        body: [
          "Cookies are small files a website stores on your device. Similar technologies include local storage and pixels. They can be strictly necessary, or optional.",
        ],
      },
      {
        heading: "What we currently use",
        body: [
          "This site currently sets only strictly necessary cookies — the ones needed to keep your session and basket working and to protect against fraud. These do not require your consent.",
          "We do not currently run advertising or third-party tracking cookies. If that changes, we will ask for your consent first through a banner, and update this page before doing so.",
        ],
      },
      {
        heading: "Analytics",
        body: [
          "Where we measure how the site is used, we do so with hashed identifiers rather than raw IP addresses, and we do not attempt to identify individual visitors.",
        ],
      },
      {
        heading: "Controlling cookies",
        body: [
          "You can delete or block cookies in your browser settings. Blocking strictly necessary cookies will stop parts of the site, such as checkout, from working.",
        ],
      },
    ],
  },

  {
    slug: "shipping",
    title: "Shipping",
    summary: "Where we deliver, how long it takes, and what it costs.",
    updated: "August 2026",
    sections: [
      {
        heading: "Where we deliver",
        body: [
          "We currently deliver across India. [Confirm serviceable pin codes and any exclusions.]",
        ],
      },
      {
        heading: "Dispatch and delivery times",
        list: [
          "Orders placed before [cut-off time] on a working day are dispatched the same day.",
          "Metro cities: [X–X] working days.",
          "Rest of India: [X–X] working days.",
          "Delivery estimates exclude Sundays and public holidays.",
        ],
      },
      {
        heading: "Charges",
        list: [
          "Standard delivery: ₹[amount].",
          "Free delivery on orders over ₹[amount].",
          "Any duties or local charges, where applicable, are shown before payment.",
        ],
      },
      {
        heading: "Tracking",
        body: [
          "You will get a tracking link by email once your order is dispatched. If tracking has not updated for [X] working days, contact us and we will chase the carrier.",
        ],
      },
      {
        heading: "If something goes wrong",
        body: [
          "If your parcel arrives damaged, photograph it before opening where you can, and contact us within [X] days. We will replace it or refund you.",
        ],
      },
    ],
  },

  {
    slug: "returns",
    title: "Returns and Refunds",
    summary: "Changed your mind, or something isn't right.",
    updated: "August 2026",
    sections: [
      {
        heading: "Changed your mind",
        body: [
          "You can return most items within [X] days of delivery for a full refund. The item must be unused and in its original packaging, with any seals intact.",
        ],
      },
      {
        heading: "What can't be returned",
        list: [
          "Items sealed for hygiene reasons where the seal has been broken.",
          "Personalised or made-to-order items.",
          "Gift cards.",
        ],
      },
      {
        heading: "How to return something",
        list: [
          `Email ${COMPANY.supportEmail} with your order number and what you'd like to do.`,
          "We will send you a return label or arrange a pickup.",
          "Pack the item securely — reuse our packaging if you can.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "Once we receive and check the item, we refund to your original payment method within [X] working days. Your bank may take a few days more to show it.",
          "Where you are returning because the item is faulty or wrongly described, we also refund the delivery charge and cover the return cost.",
        ],
      },
      {
        heading: "Exchanges",
        body: [
          "We do not process direct exchanges. Return the item for a refund and place a new order — it is faster.",
        ],
      },
    ],
  },

  {
    slug: "faq",
    title: "Questions",
    summary: "The things people ask most.",
    updated: "August 2026",
    format: "faq",
    sections: [
      {
        heading: "How long does delivery take?",
        body: [
          "Metro cities usually [X–X] working days, rest of India [X–X]. You get a tracking link as soon as your order leaves us.",
        ],
      },
      {
        heading: "Can I return something if I change my mind?",
        body: [
          "Yes — within [X] days, unused and in its original packaging. Full details are on the Returns page.",
        ],
      },
      {
        heading: "Is there a warranty?",
        body: [
          "Every product carries a [X]-year warranty against manufacturing defects, on top of your statutory rights.",
        ],
      },
      {
        heading: "Do you ship outside India?",
        body: ["Not yet. Join the email list and we will tell you when that changes."],
      },
      {
        heading: "How do I track my order?",
        body: [
          `Use the link in your dispatch email. If it has not updated for a few days, email ${COMPANY.supportEmail} with your order number.`,
        ],
      },
      {
        heading: "What payment methods do you take?",
        body: ["[UPI, cards, net banking, wallets — confirm with your payment provider.]"],
      },
      {
        heading: "Are your products safe for children?",
        body: [
          "Our products are designed for adults unless a listing says otherwise. Check the individual product page for age guidance and any small-parts warning.",
        ],
      },
      {
        heading: "How do I unsubscribe from emails?",
        body: [
          "Use the unsubscribe link at the bottom of any email. It takes effect immediately.",
        ],
      },
    ],
  },

  {
    slug: "contact",
    title: "Contact",
    summary: "Talk to a person.",
    updated: "August 2026",
    sections: [
      {
        heading: "Support",
        body: [
          `Email ${COMPANY.supportEmail} and we will reply within [X] working hours. Include your order number if you have one — it gets you a faster answer.`,
        ],
      },
      {
        heading: "Everything else",
        list: [
          `General: ${COMPANY.email}`,
          `Privacy requests: ${COMPANY.privacyEmail}`,
          `Phone: ${COMPANY.phone}`,
          `Post: ${COMPANY.address}`,
        ],
      },
      {
        heading: "Complaints",
        body: [
          "If we have got something wrong, say so and we will fix it. If you are still unhappy, you can escalate to the grievance officer named below, as required by the Consumer Protection (E-Commerce) Rules 2020.",
          "Grievance Officer: [Name], [email], [phone]. We acknowledge complaints within 48 hours and resolve them within one month.",
        ],
      },
    ],
  },
];

export const getDoc = (slug: string) => DOCS.find((d) => d.slug === slug);
