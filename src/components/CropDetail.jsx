import { getCropName, resolveBadCompanion } from '../data/catalog'

export default function CropDetail({ crop }) {
  const dtm = crop.days_to_maturity
  const sp = crop.spacing_in
  const ph = crop.soil_ph_range

  return (
    <div className="detail-view">
      <h2>{crop.name}</h2>
      <p className="meta">
        {crop.category} &middot; {crop.family} &middot; {dtm.min}-{dtm.max} days to maturity
      </p>
      <p>{crop.notes}</p>

      <div className="section">
        <h4>Growing conditions</h4>
        <p>
          Full spacing: {sp.row}&Prime; between rows, {sp.plant}&Prime; between plants &middot; Sun: {crop.sun} &middot; Soil pH{' '}
          {ph.min}&ndash;{ph.max} &middot; Prefers {crop.soil_type_pref.join(', ')} soil &middot; ~{crop.water_in_per_week}&Prime;
          water/week
        </p>
        <p>
          <strong>Underwatered:</strong> {crop.water_guidance.underwater_signs}
          <br />
          <strong>Overwatered:</strong> {crop.water_guidance.overwater_signs}
        </p>
      </div>

      <div className="section">
        <h4>Spacing consequences</h4>
        <p>
          <strong>Too close:</strong> {crop.spacing_consequences.too_close}
          <br />
          <strong>Too far:</strong> {crop.spacing_consequences.too_far}
        </p>
      </div>

      <div className="section">
        <h4>Companions</h4>
        {crop.companions.good.map((g) => (
          <div className="companion-item" key={g.id}>
            <strong>{getCropName(g.id)}</strong> — good pairing
            <div className="note">{g.note}</div>
          </div>
        ))}
        {crop.companions.bad.map((b) => {
          const r = resolveBadCompanion(b)
          return (
            <div className="companion-item bad" key={r.id}>
              <strong>{getCropName(r.id)}</strong> — {r.reasonLabel}
              <div className="note">
                {r.explanation}
                {r.mitigation ? <> {r.mitigation}</> : null}
              </div>
            </div>
          )
        })}
        {crop.companions.good.length === 0 && crop.companions.bad.length === 0 && (
          <p className="meta">No notable companion pairings recorded for this crop yet.</p>
        )}
      </div>

      <div className="section">
        <h4>Soil &amp; feeding</h4>
        <p>
          Nutrient needs: {crop.nutrient_needs.join(', ')}
          <br />
          Amendment flags: {crop.amendment_flags.join(', ')}
          <br />
          Grows well after: {crop.feeds_after.length ? crop.feeds_after.map(getCropName).join(', ') : '—'}
          <br />
          Depletes soil for: {crop.depletes_for.length ? crop.depletes_for.map(getCropName).join(', ') : '—'}
        </p>
      </div>

      <div className="section">
        <h4>Pests &amp; disease</h4>
        <p>
          Common pests: {crop.common_pests.join(', ')}
          <br />
          Common diseases: {crop.common_diseases.join(', ')}
        </p>
      </div>

      <div className="section">
        <h4>Yield</h4>
        <p>
          ~{crop.yield_estimate.amount} {crop.yield_estimate.unit.replace(/_/g, ' ')}
          {crop.yield_estimate.confidence && <span className="badge estimated">{crop.yield_estimate.confidence}</span>}
        </p>
      </div>
    </div>
  )
}
