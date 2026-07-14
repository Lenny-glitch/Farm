export default function AnimalDetail({ animal }) {
  const y = animal.yield

  return (
    <div className="detail-view">
      <h2>{animal.name}</h2>
      <p className="meta">
        {animal.space_sqft_per_animal} sqft ({animal.space_type.replace(/_/g, ' ')}) &middot; matures in {animal.maturity_weeks} weeks
        &middot; productive ~{animal.productive_lifespan_years} yrs
      </p>
      <p>{animal.notes}</p>

      <div className="section">
        <h4>Feed &amp; water</h4>
        <p>
          {animal.feed.lbs_per_month} lbs/month ({animal.feed.type.replace(/_/g, ' ')}) &middot; {animal.water_gal_per_day} gal
          water/day
        </p>
        <p className="meta">
          Self-sufficient option: grow {animal.feed.self_sufficient_option.feed_crop.replace(/_/g, ' ')} — roughly{' '}
          {animal.feed.self_sufficient_option.sqft_needed_per_animal} sqft per animal
          {animal.feed.self_sufficient_option.confidence && (
            <span className="badge estimated">{animal.feed.self_sufficient_option.confidence}</span>
          )}
        </p>
      </div>

      <div className="section">
        <h4>Yield</h4>
        <p>
          {y.primary.amount_per_week} {y.primary.unit}/week of {y.primary.product}
          {y.primary.confidence && <span className="badge estimated">{y.primary.confidence}</span>}
          <br />
          Manure: ~{y.manure_lbs_per_month} lbs/month
        </p>
        {y.secondary.map((s, i) => (
          <p className="meta" key={i}>
            Also: {s.product} — {s.note}
          </p>
        ))}
      </div>

      <div className="section">
        <h4>Uses</h4>
        <p>{animal.uses.join(', ')}</p>
      </div>

      {animal.byproducts.length > 0 && (
        <div className="section">
          <h4>Byproducts</h4>
          {animal.byproducts.map((b) => (
            <div className="companion-item" key={b.id}>
              <strong>{b.id}</strong> — {b.raw_use.replace(/_/g, ' ')}
              {b.cure_required_days > 0 && <span> &middot; cure {b.cure_required_days} days</span>}
              <div className="note">{b.cure_method}</div>
              <div className="note">{b.safety_note}</div>
            </div>
          ))}
        </div>
      )}

      <div className="section">
        <h4>Compatible with</h4>
        <p>{animal.compatible_with.join(', ')}</p>
      </div>
    </div>
  )
}
