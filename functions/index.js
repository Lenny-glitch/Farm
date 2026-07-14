const { onRequest } = require('firebase-functions/v2/https')

// Placeholder to prove the Functions project deploys and is wired up.
// Layer 1 is static data, no external API calls needed yet — real proxy
// endpoints (weather/soil APIs etc.) land in Layer 2+, replacing this.
exports.ping = onRequest((req, res) => {
  res.json({ ok: true, service: 'farmmapper-functions' })
})
