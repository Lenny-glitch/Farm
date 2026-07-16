import companionReasons from '../../data/companion_reasons.json'

// Plain-language definitions for nutrient tags, the other "notable keyword"
// category called out in the brief besides companion reasons (which already
// have label/explanation in companion_reasons.json — reused below rather
// than duplicated).
const NUTRIENT_TAGS = {
  nitrogen_heavy: 'Needs a lot of nitrogen from the soil — benefits from compost or manure.',
  prefers_manure: 'Grows best with manure worked into the soil.',
  low_nitrogen_self_fixing:
    "Pulls its own nitrogen from the air instead of the soil — doesn't need nitrogen-rich soil, and can even improve it for the next crop.",
  phosphorus_for_pods: 'Needs phosphorus to develop healthy pods.',
  phosphorus_for_fruit: 'Needs phosphorus to develop healthy fruit.',
  calcium_for_blossom_end_rot: 'Needs steady calcium — low calcium can cause dark, sunken spots on the fruit.',
  moderate_nitrogen: 'Needs a moderate, steady amount of nitrogen — not a heavy feeder.',
  potassium_for_fruit: 'Needs potassium to support fruit development.',
  low_nitrogen: "Doesn't need much nitrogen — too much can hurt more than help.",
  potassium_for_roots: 'Needs potassium to support root development.'
}

// Returns { label, explanation } or null if the keyword isn't recognized.
export function getKeywordDefinition(keyword) {
  if (companionReasons[keyword]) {
    return companionReasons[keyword]
  }
  if (NUTRIENT_TAGS[keyword]) {
    return { label: keyword.replace(/_/g, ' '), explanation: NUTRIENT_TAGS[keyword] }
  }
  return null
}
