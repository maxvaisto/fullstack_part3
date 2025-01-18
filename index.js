require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const mongoose = require('mongoose')


app.use(cors())
app.use(express.json())
app.use(express.static('dist'))


app.use(morgan(function (tokens, req, res) {
  if (req.method === "POST") {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      // response time
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body),
    ].join(' ');
  }
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    // response time
    tokens['response-time'](req, res), 'ms',
  ].join(' ');
}));


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})


app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    }
  })
    .catch(
      error => {
        console.log(error)
        response.status(404).end()
      }
    )


})


app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })

})


app.post('/api/persons', (request, response) => {
  const body = request.body


  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  Person.find( {name: body.name}).then(result =>
    {
      if (result.length > 0) {
        return response.status(400).json({
          error: 'name must be unique'
        })
      }
      else {
        const person = new Person({
          id: '' + Math.floor(Math.random() * 1000),
          name: body.name,
          number: body.number
        })

        person.save().then(savedPerson => {
          response.json(savedPerson)
        })
      }
    }
  )
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id).then(result => {
    response.status(204).end()
  })
    .catch(error => {
      console.log(error)
      response.status(404).end()
    })
})

app.get('/info', (request, response) => {
  Person.find({}).then(result => {
    response.send(`<p>Phonebook has info for ${result.length} people</p><p>${Date()}</p>`)
  })
})


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})