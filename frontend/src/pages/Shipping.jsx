
import { Link } from 'react-router-dom'
import './shipping.css'

const heroImage =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2400&q=85'

function EnquiryLink({ subject, children }) {
  return (
    <Link to={`/enquiry?subject=${encodeURIComponent(subject)}`}>
      {children}
    </Link>
  )
}

export default function Shipping() {
  return (
    <main className="shipping-page">
      <section
        className="shipping-hero"
        style={{ backgroundImage: `url("${heroImage}")` }}
        aria-label="Fashion editorial"
      >
        <div className="shipping-hero-overlay" />
      </section>

      <article className="shipping-copy">
        <h1>Shipping / Returns</h1>

        <section>
          <h2>When will my order be shipped?</h2>
          <p>
            Orders are processed after payment has been confirmed. Processing
            times may vary depending on product availability, order volume,
            public holidays, and other operational circumstances. We will
            communicate any known delays where possible.
          </p>
          <p>
            Once your order has been dispatched, we will provide available
            delivery or tracking information. If you have not received an
            update, please <EnquiryLink subject="Order enquiry">contact our customer team</EnquiryLink>.
          </p>
        </section>

        <section>
          <h2>Which delivery options do you offer?</h2>
          <p>
            Available delivery methods and charges will be displayed at
            checkout or confirmed before your order is dispatched. Options
            may vary by destination and the size or weight of your order.
          </p>
        </section>

        <section>
          <h2>Where do you ship?</h2>
          <p>
            This store is being prepared to serve customers in Nigeria.
            Available delivery locations will be confirmed at checkout.
            Delivery outside Nigeria will be offered only where the store
            has confirmed that it can fulfil the order.
          </p>
        </section>

        <section>
          <h2>How long is delivery?</h2>
          <p>
            Delivery estimates depend on the destination, selected courier,
            dispatch date, and any circumstances affecting the journey.
            The estimated timeframe will be provided at checkout or when
            your order is confirmed.
          </p>
          <p>
            Delivery estimates are not guarantees. Courier delays, weather,
            public holidays, access restrictions, and incorrect address
            details may affect arrival.
          </p>
        </section>

        <section>
          <h2>How much does shipping cost?</h2>
          <p>
            Shipping charges will be displayed at checkout before payment.
            Any applicable delivery surcharge will be communicated before
            the order is placed.
          </p>
        </section>

        <section>
          <h2>What if my order does not arrive?</h2>
          <p>
            If your order appears delayed or tracking has not updated,
            please allow for the delivery estimate provided with your order.
            If it still has not arrived, submit an enquiry with your order
            number so our team can investigate with the delivery provider.
          </p>
          <p>
            <EnquiryLink subject="Missing order">Contact us about a missing order</EnquiryLink>.
          </p>
        </section>

        <section>
          <h2>What if my package or item arrives damaged?</h2>
          <p>
            Please contact us as soon as reasonably possible. Include your
            order number, a description of the issue, and clear photographs
            of the item and packaging where available. We will review the
            information and explain the next steps.
          </p>
          <p>
            <EnquiryLink subject="Damaged item">Report a damaged item</EnquiryLink>.
          </p>
        </section>

        <section>
          <h2>Can I return or exchange an item?</h2>
          <p>
            We want you to be happy with your purchase. Return and exchange
            eligibility, the applicable time limit, item-condition
            requirements, and any exclusions must be confirmed in the
            store's final policy before orders open.
          </p>
          <p>
            If your item is faulty, damaged, incorrect, or unsuitable,
            contact us with your order details. We will explain the options
            available under the store's policy and applicable consumer law.
          </p>
          <p>
            <EnquiryLink subject="Returns and exchanges">Ask about a return or exchange</EnquiryLink>.
          </p>
        </section>

        <section>
          <h2>How do I request a return?</h2>
          <p>
            Please contact our team before sending an item back. Include
            your order number, the item concerned, and the reason for your
            request. We will confirm whether the request is eligible and
            provide the appropriate return instructions.
          </p>
          <p>
            Please do not send items to an address that has not been
            confirmed by our team.
          </p>
          <p>
            <EnquiryLink subject="Returns and exchanges">Start a return enquiry</EnquiryLink>.
          </p>
        </section>

        <section>
          <h2>Important information about returns</h2>
          <ul>
            <li>
              Keep your order confirmation and any delivery documentation.
            </li>
            <li>
              Unless otherwise agreed, items should be returned in an
              appropriate condition with their original labels and
              packaging where available.
            </li>
            <li>
              Please obtain proof of postage or shipment when returning
              an item.
            </li>
            <li>
              Refund timing depends on the outcome of the review and the
              payment provider's processing time.
            </li>
            <li>
              Nothing in this policy is intended to limit any rights you
              have under applicable Nigerian law.
            </li>
          </ul>
        </section>

        <section>
          <h2>Can I change or cancel my order?</h2>
          <p>
            If you need to change or cancel an order, contact us as soon
            as possible and include your order number. We will check
            whether the order can still be changed or stopped. A request
            cannot be guaranteed once an order has entered fulfilment
            or been dispatched.
          </p>
          <p>
            <EnquiryLink subject="Cancel an order">Submit an order cancellation request</EnquiryLink>.
          </p>
        </section>

        <section>
          <h2>Customs, duties and taxes</h2>
          <p>
            For deliveries within Nigeria, any applicable charges will be
            communicated where relevant. If international delivery becomes
            available, customs duties, import taxes, and related charges
            may apply depending on the destination and applicable rules.
            These details will be explained before international orders
            are accepted.
          </p>
        </section>

        <section>
          <h2>Customer service</h2>
          <p>
            Need help with an order or delivery? Send our team an enquiry
            and include your order number so we can assist you.
          </p>
          <p>
            <EnquiryLink subject="Customer service">Contact customer service</EnquiryLink>.
          </p>
        </section>
      </article>
    </main>
  )
}
