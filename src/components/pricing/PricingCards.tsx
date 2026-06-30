"use client";

type Catalog = any;

function money(value: number | null | undefined) {
  if (value === null || value === undefined) return "Custom";
  return `£${Number(value).toFixed(2).replace(".00", "")}`;
}

export default function PricingCards({ catalog }: { catalog: Catalog }) {
  return (
    <main style={{ background: "#f8fcff", color: "#102a43", minHeight: "100vh", padding: "36px 18px", fontFamily: "Inter, Arial, sans-serif" }}>
      <section style={{ width: "min(1180px, 100%)", margin: "0 auto" }}>
        <div style={{ background: "#fff", border: "4px solid #102a43", borderRadius: 34, padding: 30, boxShadow: "10px 10px 0 rgba(16,42,67,.10)", marginBottom: 24 }}>
          <p style={{ color: "#2667ff", fontWeight: 950 }}>British English Academy Pricing</p>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 68px)", lineHeight: .95, letterSpacing: "-.07em", margin: "8px 0" }}>
            Start with the Level Test. Unlock the right course.
          </h1>
          <p style={{ color: "#5a6b7b", fontSize: 18 }}>
            Course previews are public. The paid Level Test maps the learner pathway, unlocks the short trial lesson, then the learner can pay for the full course.
          </p>
        </div>

        <h2>Level Test</h2>
        <div className="pricing-grid">
          {catalog.products.filter((p: any) => p.type === "level_test").map((p: any) => (
            <article className="pricing-card featured" key={p.product_id}>
              <strong>{p.public_name}</strong>
              <h3>{money(p.price_gbp)}</h3>
              <p>{p.description}</p>
              <a href="/checkout/placement?source=pricing">Take Paid Level Test</a>
            </article>
          ))}
        </div>

        <h2>Single Courses</h2>
        <div className="pricing-grid">
          {catalog.courses.map((course: any) => (
            <article className="pricing-card" key={course.course_id}>
              <span>{course.level}</span>
              <strong>{course.name}</strong>
              <h3>{money(course.launch_price_gbp)}</h3>
              <p>{course.description}</p>
              <small>Launch price. Standard price {money(course.standard_price_gbp)}.</small>
              <a href={`/checkout/course?courseId=${course.course_id}`}>Start Full Course After Payment</a>
            </article>
          ))}
        </div>

        <h2>Bundles</h2>
        <div className="pricing-grid">
          {catalog.bundles.map((bundle: any) => (
            <article className="pricing-card bundle" key={bundle.bundle_id}>
              <strong>{bundle.name}</strong>
              <h3>{money(bundle.launch_price_gbp)}</h3>
              <p>{bundle.description}</p>
              <small>Launch price. Standard price {money(bundle.standard_price_gbp)}.</small>
              <a href={`/checkout/bundle?bundleId=${bundle.bundle_id}`}>Buy Bundle</a>
            </article>
          ))}
        </div>

        <h2>Subscriptions</h2>
        <div className="pricing-grid">
          {catalog.subscriptions.map((sub: any) => (
            <article className="pricing-card subscription" key={sub.subscription_id}>
              <strong>{sub.name}</strong>
              <h3>{money(sub.price_gbp)} <small>/{sub.billing}</small></h3>
              <p>{sub.description}</p>
              <a href={`/checkout/subscription?subscriptionId=${sub.subscription_id}`}>Subscribe</a>
            </article>
          ))}
        </div>

        <h2>Institution Licences</h2>
        <div className="pricing-grid">
          {catalog.institution_licences.map((licence: any) => (
            <article className="pricing-card institution" key={licence.licence_id}>
              <strong>{licence.name}</strong>
              <h3>{money(licence.price_gbp)} {licence.billing === "annual" ? <small>/year</small> : null}</h3>
              <p>{licence.description}</p>
              <small>{licence.learner_limit ? `${licence.learner_limit} learners included` : "Custom learner allocation"}</small>
              <a href={licence.requires_sales_contact ? "/contact?subject=institution" : `/checkout/institution?licenceId=${licence.licence_id}`}>
                {licence.requires_sales_contact ? "Contact LEA" : "Start Institution Plan"}
              </a>
            </article>
          ))}
        </div>
      </section>

      <style jsx>{`
        h2 { margin: 34px 0 14px; color: #102a43; font-size: 34px; letter-spacing: -.05em; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .pricing-card { background: white; border: 4px solid #102a43; border-radius: 28px; padding: 20px; box-shadow: 8px 8px 0 rgba(16,42,67,.09); display: grid; gap: 10px; }
        .pricing-card.featured { background: #ffd166; }
        .pricing-card.bundle { background: #e9f8ff; }
        .pricing-card.subscription { background: #e8fff7; }
        .pricing-card.institution { background: #f0eaff; }
        .pricing-card span { width: fit-content; background: #102a43; color: white; border-radius: 999px; padding: 6px 10px; font-weight: 950; }
        .pricing-card strong { font-size: 22px; line-height: 1.05; }
        .pricing-card h3 { font-size: 38px; letter-spacing: -.06em; margin: 0; }
        .pricing-card p { color: #5a6b7b; }
        .pricing-card small { color: #5a6b7b; font-weight: 800; }
        .pricing-card a { background: #ff8c42; color: white; text-align: center; border-radius: 16px; padding: 13px 16px; text-decoration: none; font-weight: 950; box-shadow: 0 7px 0 rgba(255,140,66,.24); }
        @media (max-width: 900px) { .pricing-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
