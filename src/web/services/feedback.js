const Feedback = require('../../models/Feedback.js').model

async function createFeedback (userID, username, content) {
  const feedback = new Feedback({
    type: 'web',
    userID,
    username,
    content
  })

  const saved = await feedback.save()
  return saved.toJSON()
}

module.exports = {
  createFeedback
}
