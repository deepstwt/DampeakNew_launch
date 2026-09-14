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
  /**
   * Where approved returns are posted. Separate from the registered address on
   * purpose — the place that receives parcels is rarely the place on the
   * incorporation certificate, and the returns policy publishes this one.
   */
  returnsAddress: "[Returns address]",
  gstin: "[GSTIN]",
  cin: "[CIN / registration number]",
  jurisdiction: "[City], India",
} as const;

export type Section = {
  heading: string;
  body?: string[];
  list?: string[];
  /**
   * Paragraphs that belong after the list rather than before it.
   *
   * A section that reads "to qualify, items must: … — and we decide whether
   * they do" needs its last sentence under the conditions, not above them.
   * `body` renders first by design, so this is the other half of that.
   */
  after?: string[];
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
  /**
   * Whether this is a legal document. Everything under /[doc] was one when the
   * route was written, so the draft notice went on all of them; About is a brand
   * page that happens to live at the same level, and telling a visitor that our
   * company story has not been reviewed by a lawyer reads as a mistake, because
   * it is one.
   */
  legal?: boolean;
};

export const DOCS: Doc[] = [
  {
    slug: "about",
    title: "About Us",
    legal: false,
    summary: "Made for Better Everyday.",
    updated: "August 2026",
    cta: { label: "SHOP DAMPEAK.", href: "/products" },
    sections: [
      {
        heading: "Made for everyday living.",
        body: [
          "DAMPEAK started with a simple idea: the things we live with every day should make our daily lives better, more comfortable, relaxing, and fun.",
          "We create products designed to bring a little more comfort, convenience, personality, and fun into everyday life.",
          "From something that makes you smile to something that makes a moment more comfortable to something that makes tasks easier, we look for ideas that have a place in the way people live.",
          "We work with production partners to bring our products to life, thoughtfully developing the details that make each one feel like DAMPEAK.",
          "We're starting small, with a growing collection of products made for everyday moments. As we grow, we'll continue exploring new ideas, new ways of living, and new products that we think are worth bringing into your world.",
          "Because everyday living doesn't have to be ordinary.",
        ],
      },
    ],
  },

  {
    slug: "privacy",
    title: "Privacy Policy",
    summary: "What we collect, how we use it, and the choices you have.",
    updated: "September 2026",
    sections: [
      {
        heading: "About this policy",
        body: [
          `${COMPANY.trading.toUpperCase()} ("${COMPANY.trading.toUpperCase()}," "we," "us," or "our") respects your privacy and is committed to protecting the personal information you provide when you visit our website, browse our products, place an order, contact us, or otherwise interact with our services.`,
          "This Privacy Policy explains what information we collect, how we use it, when we may share it, and the choices you may have regarding your personal information.",
          "By accessing or using our website, you acknowledge that you have read and understood this Privacy Policy.",
        ],
      },
      {
        heading: "Personal information we collect",
        body: [
          `Depending on how you interact with ${COMPANY.trading.toUpperCase()}, we may collect the following types of personal information.`,
        ],
      },
      {
        heading: "Information you provide directly",
        body: [
          "When you place an order, contact us, create an account, subscribe to communications, or otherwise interact with us, you may provide information such as:",
        ],
        list: [
          "Full name",
          "Email address",
          "Phone number",
          "Billing address",
          "Shipping address",
          "Order and purchase information",
          "Information you provide when contacting customer support",
          "Any other information you voluntarily provide to us",
        ],
      },
      {
        heading: "Payment information",
        body: [
          "When you make a purchase, payment information is processed through our third-party payment provider.",
          "We may receive information such as payment status, transaction details, and limited payment information needed to process or manage your order. We do not necessarily receive or store your complete payment card information.",
          "Payment providers may collect and process your information according to their own privacy policies and terms.",
        ],
      },
      {
        heading: "Information collected automatically",
        body: ["When you visit our website, certain information may be collected automatically, including:"],
        list: [
          "IP address",
          "Browser type and version",
          "Device type",
          "Operating system",
          "Pages or products viewed",
          "Referring website or source",
          "Date and time of visits",
          "General information about how you interact with our website",
        ],
        after: [
          "We may collect this information using cookies, pixels, analytics tools, and similar technologies.",
        ],
      },
      {
        heading: "To process and fulfill orders",
        body: ["We may use your information to:"],
        list: [
          "Process and confirm purchases",
          "Process payments",
          "Arrange order fulfillment",
          "Ship products to you",
          "Provide order updates",
          "Process returns, refunds, or other order-related requests",
        ],
      },
      {
        heading: "To communicate with you",
        body: [
          "We may use your information to respond to questions, provide customer support, communicate about your orders, and respond to other requests you make.",
        ],
      },
      {
        heading: "To improve our website and products",
        body: [
          "We may use information about how customers interact with our website and products to understand customer preferences, improve our website, develop our products, and improve the overall customer experience.",
        ],
      },
      {
        heading: "Marketing and promotional communications",
        body: [
          `Where permitted by applicable law, we may use your contact information to send promotional emails or other marketing communications about ${COMPANY.trading.toUpperCase()} products, offers, announcements, or other content we believe may be relevant to you.`,
          "You can unsubscribe from promotional emails at any time by using the unsubscribe link included in the communication.",
        ],
      },
      {
        heading: "Website analytics and advertising",
        body: [
          "We may use analytics and advertising technologies to understand how visitors interact with our website, measure the effectiveness of our marketing, and improve our advertising.",
          "These technologies may include cookies, pixels, tags, and similar tracking technologies provided by third-party services.",
          "Depending on the technology used and applicable law, these services may collect information about your device, browsing activity, and interactions with our website.",
        ],
      },
      {
        heading: "Security and fraud prevention",
        body: [
          `We may use personal information to help detect, prevent, and investigate fraud, unauthorized activity, security incidents, or other activity that could harm ${COMPANY.trading.toUpperCase()}, our customers, or our website.`,
        ],
      },
      {
        heading: "Legal and business purposes",
        body: ["We may use or disclose personal information when reasonably necessary to:"],
        list: [
          "Comply with applicable laws or legal obligations",
          "Respond to lawful requests from government authorities",
          "Enforce our policies or agreements",
          "Protect our rights, property, or safety",
          "Protect the rights, property, or safety of our customers or others",
          "Resolve disputes",
          "Support a business transaction, such as a merger, acquisition, restructuring, or sale of assets",
        ],
      },
      {
        heading: "How we share personal information",
        body: [
          "We do not sell your personal information for money.",
          "We may share personal information with third parties when reasonably necessary to operate our business and provide our services.",
        ],
      },
      {
        heading: "Service providers",
        body: [
          "We may work with third-party companies that help us operate our website and business, including providers involved in:",
        ],
        list: [
          "Payment processing",
          "Website hosting and technology",
          "Order fulfillment",
          "Shipping and delivery",
          "Customer support",
          "Email and marketing",
          "Website analytics",
          "Advertising",
          "Fraud prevention",
          "Other business operations",
        ],
        after: [
          "These service providers may access personal information only as reasonably necessary to provide services to us.",
        ],
      },
      {
        heading: "Business and legal requirements",
        body: [
          "We may disclose information when required or permitted by applicable law, including in response to valid legal processes or requests from authorities.",
          "We may also share information when necessary to protect our rights, customers, business, or property.",
        ],
      },
      {
        heading: "Business transfers",
        body: [
          `If ${COMPANY.trading.toUpperCase()} is involved in a merger, acquisition, financing, reorganization, sale of assets, or similar business transaction, personal information may be transferred as part of that transaction.`,
        ],
      },
      {
        heading: "Cookies and similar technologies",
        body: [
          `${COMPANY.trading.toUpperCase()} may use cookies and similar technologies to operate and improve our website. Cookies may help us:`,
        ],
        list: [
          "Remember preferences",
          "Keep shopping sessions functioning",
          "Understand how visitors use our website",
          "Measure website performance",
          "Analyze marketing performance",
          "Provide relevant advertising",
        ],
        after: [
          "You may be able to control or disable certain cookies through your browser settings. However, disabling cookies may affect certain website functionality.",
        ],
      },
      {
        heading: "Third-party websites and services",
        body: [
          "Our website may contain links to websites, social media platforms, payment providers, or other services operated by third parties.",
          "If you choose to interact with a third-party service, that service may collect and process your information according to its own privacy policy and terms.",
          `${COMPANY.trading.toUpperCase()} is not responsible for the privacy practices, security, or content of third-party websites or services.`,
        ],
      },
      {
        heading: "Children's privacy",
        body: [
          "Our website and services are not directed toward children under the age of 13, and we do not knowingly collect personal information from children under 13.",
          "If you believe that a child has provided us with personal information, please contact us so that we can review the situation and take appropriate action.",
        ],
      },
      {
        heading: "Data security",
        body: [
          "We take reasonable administrative, technical, and organizational measures to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure.",
          "However, no method of transmitting or storing information online is completely secure. We therefore cannot guarantee the absolute security of your personal information.",
        ],
      },
      {
        heading: "Data retention",
        body: [
          "We retain personal information for as long as reasonably necessary for the purposes described in this Privacy Policy, including to provide our services, complete transactions, maintain business records, comply with legal obligations, resolve disputes, and enforce our agreements.",
          "The length of time we retain information may vary depending on the type of information and the reason it was collected.",
        ],
      },
      {
        heading: "Your privacy rights",
        body: [
          "Depending on where you live and applicable law, you may have certain rights regarding your personal information. These rights may include the right to:",
        ],
        list: [
          "Request access to personal information we hold about you",
          "Request correction of inaccurate information",
          "Request deletion of certain personal information",
          "Request a copy of your personal information",
          "Opt out of certain marketing communications",
          "Opt out of certain targeted advertising or other data uses where applicable",
          "Withdraw consent where processing is based on consent",
        ],
        after: [
          "To make a privacy request, please contact us using the information provided below. We may need to verify your identity before completing certain requests.",
          "Your legal rights may vary depending on your location, and some requests may be subject to legal exceptions.",
        ],
      },
      {
        heading: "Changes to this Privacy Policy",
        body: [
          "We may update this Privacy Policy from time to time to reflect changes to our business, website, services, technology, or applicable laws.",
          'When we make changes, we will update the "Last updated" date at the top of this policy.',
          "We encourage you to review this Privacy Policy periodically to stay informed about how we handle personal information.",
        ],
      },
      {
        heading: "Contact us",
        body: [
          `If you have questions about this Privacy Policy or how ${COMPANY.trading.toUpperCase()} handles your personal information, please contact us:`,
        ],
        list: [
          COMPANY.trading.toUpperCase(),
          `Email: ${COMPANY.supportEmail}`,
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
          "Prices are shown in US Dollars and include applicable taxes unless stated otherwise.",
          "Delivery charges are shown separately before you pay.",
          "Payment is taken at checkout through our payment provider. We do not store your card details.",
          "If a price is obviously wrong, we will contact you before dispatch rather than simply cancelling.",
        ],
      },
      {
        heading: "Delivery",
        body: [
          "Delivery times are estimates. Risk in the goods passes to you on delivery.",
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
        heading: "No medical claims",
        body: [
          "We don't make medical or therapeutic claims. These are made to be good to hold, not to treat anything. Anything we quote from published research describes what that research observed, not what our products do. If something is wrong, please talk to a doctor.",
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
    slug: "returns",
    title: "Refund & Return Policy",
    summary: "Replacements and refunds for anything defective, damaged or not right.",
    updated: "September 2026",
    sections: [
      {
        heading: "Our promise",
        body: [
          "It is our vision to ensure that you're happy and satisfied after you've purchased your item, and we want to keep it that way no matter what. We'll be more than happy to replace or refund your item if it is defective, damaged, or if you're not satisfied with the results.",
        ],
      },
      {
        heading: "Initiating a return",
        body: [
          `All returns must be pre-authorized by contacting us at ${COMPANY.supportEmail} before sending any product back.`,
          "Items sent to our return address without receiving return instructions from us first would be rejected, and are at the customer's risk.",
        ],
      },
      {
        heading: "Return eligibility",
        body: ["To qualify for a return or refund, items must:"],
        list: [
          "Be requested within 30 days of delivery.",
          "Be unused and in their original condition.",
          "Include the original packaging, where applicable.",
          "Not be damaged as a result of use, misuse, or improper handling.",
        ],
        after: [
          `${COMPANY.trading.toUpperCase()} reserves the right to determine whether a returned item meets the eligibility requirements.`,
        ],
      },
      {
        heading: "Damaged or defective items",
        body: [
          `If your order arrives damaged, defective, or with the wrong item, please contact us at ${COMPANY.supportEmail} as soon as possible.`,
          "Please include your order number and clear photos of the item and packaging so we can assess the issue and determine the appropriate resolution.",
          "If the issue is confirmed to be our error or a product defect, we may offer a replacement, refund, or other appropriate resolution.",
        ],
      },
      {
        heading: "Customer responsibility",
        list: [
          "Customers are responsible for securely packaging approved returns to help prevent damage during transit.",
          `${COMPANY.trading} is not liable for items lost or damaged during the return transit.`,
          "All return-shipping costs are the responsibility of the customer.",
        ],
      },
      {
        heading: "Return address",
        body: [
          `Approved returns must be mailed to the following address: ${COMPANY.returnsAddress}`,
        ],
      },
      {
        heading: "Refund processing",
        body: [
          "Refunds are issued to the original payment method within 7–15 business days after the returned item has been received and inspected.",
          "Claims for missing deliveries must be made within 15 days of the expected delivery date; after this period, refunds or reshipments cannot be provided.",
        ],
      },
      {
        heading: "Missing or undelivered orders",
        body: [
          `If your order has not arrived or appears to be missing, please contact us at ${COMPANY.supportEmail} with your order number.`,
          "We will review the shipment status and work with you to determine the appropriate next step.",
        ],
      },
      {
        heading: "Shipping information",
        body: [
          "Customers are responsible for providing complete and accurate shipping information at checkout.",
          `${COMPANY.trading.toUpperCase()} is not responsible for orders that are undeliverable or misdelivered due to incorrect or incomplete shipping addresses provided by the customer.`,
          "If a package is returned due to an incorrect or incomplete address, additional shipping charges may apply if the customer requests that the order be reshipped.",
        ],
      },
      {
        heading: "Exchanges",
        body: [
          "We do not currently offer direct exchanges.",
          `If you would like a different ${COMPANY.trading.toUpperCase()} product, please contact us regarding your original order and we can advise you on the available options.`,
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
        ],
      },
      {
        heading: "Company details",
        list: [
          `Registered name: ${COMPANY.legalName}`,
          `Trading as: ${COMPANY.trading}`,
          `Registration number: ${COMPANY.cin}`,
          `GSTIN: ${COMPANY.gstin}`,
          `Email: ${COMPANY.email}`,
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
