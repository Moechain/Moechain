const express = require('express')
const router = express.Router()
const joi = require('joi')

// sign in senator , moechain will select the person with the most votes
// to be a senator and select a speaker in chronological order
// add 'type' and 'username' to transaction data
router.post('/registerSenator', (req, res) => {
  const schema = {
    username: joi
      .string()
      .min(1)
      .max(66)
      .required()
  }
  const result = joi.validate(body, schema)
  if (result.error !== null) {
    return res.json({
      msg: 'username is required and min length is 1, max length is 66'
    })
  }
  
})

module.exports = router
