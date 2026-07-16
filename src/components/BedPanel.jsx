import { useMemo, useState } from 'react'
import { crops, animals, getEntry, getEntryName } from '../data/catalog'
import { SUN_LEVELS, SOIL_TYPES, suggestForBed } from '../data/suggestBeds'
import { addPlanting, deleteBed, removePlanting, updateBed, usePlantings } from '../data/plots'
import InfoLink from './InfoLink'
import PlantingPicker from './PlantingPicker'

const SUGGESTIONS_PAGE = 5

export default function BedPanel({ uid, plotId, bed, onClose }) {
  const [name, setName] = useState(bed.name)
  const [notes, setNotes] = useState(bed.notes || '')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showAllSuggestions, setShowAllSuggestions] = useState(false)

  const plantings = usePlantings(uid, plotId, bed.id)
  const suggestions = useMemo(() => suggestForBed(bed.conditions, { crops, animals }), [bed.conditions])
  const visibleSuggestions = showAllSuggestions ? suggestions : suggestions.slice(0, SUGGESTIONS_PAGE)

  function saveConditions(patch) {
    updateBed(uid, plotId, bed.id, { conditions: { ...bed.conditions, ...patch } })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet bed-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <input
          className="bed-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name !== bed.name && updateBed(uid, plotId, bed.id, { name: name.trim() })}
        />

        <div className="section">
          <h4>Notes</h4>
          <textarea
            className="bed-notes"
            placeholder="Anything worth remembering about this bed..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== (bed.notes || '') && updateBed(uid, plotId, bed.id, { notes })}
          />
        </div>

        <div className="section">
          <h4>Conditions</h4>
          <div className="conditions-form">
            <label>
              Sun
              <select value={bed.conditions?.sun || ''} onChange={(e) => saveConditions({ sun: e.target.value || null })}>
                <option value="">Not sure</option>
                {SUN_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Soil
              <select
                value={bed.conditions?.soil_type || ''}
                onChange={(e) => saveConditions({ soil_type: e.target.value || null })}
              >
                <option value="">Not sure</option>
                {SOIL_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              About how big? (sqft)
              <input
                type="number"
                min="0"
                placeholder="optional"
                value={bed.conditions?.approx_size_sqft ?? ''}
                onChange={(e) => saveConditions({ approx_size_sqft: e.target.value ? Number(e.target.value) : null })}
              />
            </label>
          </div>
        </div>

        <div className="section">
          <div className="section-header-row">
            <h4>What's planted here</h4>
            <button type="button" className="btn-small" onClick={() => setPickerOpen(true)}>
              + Add
            </button>
          </div>
          {plantings.length === 0 && <p className="meta">Nothing added yet.</p>}
          {plantings.map((p) => (
            <div className="planting-item" key={p.id}>
              <InfoLink kind={p.entry_type} id={p.entry_id}>
                {getEntryName(p.entry_type, p.entry_id)}
              </InfoLink>
              {p.note && <span className="note"> — {p.note}</span>}
              <button
                type="button"
                className="remove-link"
                onClick={() => removePlanting(uid, plotId, bed.id, p.id)}
                aria-label={`Remove ${getEntryName(p.entry_type, p.entry_id)}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="section">
          <h4>Suggestions for this bed</h4>
          <div className="suggestion-list">
            {visibleSuggestions.map((s) => (
              <div className="suggestion-card" key={s.entry.id}>
                <div className="suggestion-head">
                  <InfoLink kind={s.entryType} id={s.entry.id} className="suggestion-name">
                    {s.entry.name}
                  </InfoLink>
                  <span className={`grade-badge grade-${s.grade.replace(/\s+/g, '-')}`}>{s.grade}</span>
                </div>
                <ul className="suggestion-reasons">
                  {s.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                {s.entryType === 'crop' && getEntry('crop', s.entry.id)?.nutrient_needs?.length > 0 && (
                  <div className="tag-row">
                    {getEntry('crop', s.entry.id).nutrient_needs.map((tag) => (
                      <InfoLink key={tag} kind="keyword" id={tag} className="tag-chip">
                        {tag.replace(/_/g, ' ')}
                      </InfoLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {suggestions.length > SUGGESTIONS_PAGE && (
            <button type="button" className="btn-ghost" onClick={() => setShowAllSuggestions((v) => !v)}>
              {showAllSuggestions ? 'Show fewer' : `Show all ${suggestions.length}`}
            </button>
          )}
        </div>

        <div className="section danger-zone">
          {!confirmDelete ? (
            <button type="button" className="btn-ghost danger" onClick={() => setConfirmDelete(true)}>
              Delete this bed
            </button>
          ) : (
            <div className="confirm-row">
              <span>Delete this bed and everything planted in it?</span>
              <button type="button" className="btn-ghost" onClick={() => setConfirmDelete(false)}>
                No
              </button>
              <button
                type="button"
                className="btn-primary danger"
                onClick={() => {
                  deleteBed(uid, plotId, bed.id)
                  onClose()
                }}
              >
                Yes, delete
              </button>
            </div>
          )}
        </div>

        {pickerOpen && (
          <PlantingPicker
            onClose={() => setPickerOpen(false)}
            onPick={(entryType, entryId) => {
              addPlanting(uid, plotId, bed.id, { entry_type: entryType, entry_id: entryId })
              setPickerOpen(false)
            }}
          />
        )}
      </div>
    </div>
  )
}
