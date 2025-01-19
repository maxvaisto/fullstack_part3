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

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(
      error => next(error)
    )
})


app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    }
  })
    .catch(
      error => next(error)
    )


})


app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(result => {
    response.json(result)
  })
    .catch(
      error => next(error)
    )

})


app.post('/api/persons', (request, response, next) => {
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
    .catch(
      error => next(error)
    )
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then(result => {
    response.status(204).end()
  })
    .catch(
      error => next(error)
    )
})

app.get('/info', (request, response) => {
  Person.find({}).then(result => {
    response.send(`<p>Phonebook has info for ${result.length} people</p><p>${Date()}</p>`)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})