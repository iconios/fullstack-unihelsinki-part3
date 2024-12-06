const Person = require('./models/person')
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const app = express()

function errorHandler(error, request, response, next) {
  console.error('Error message ', error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(express.static('dist'))
app.use(cors())

morgan.token('body', (req) => JSON.stringify(req.body))
morgan.token('date', () => new Date())

app.use(express.json())

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.status(200).json(persons)
  })
})

app.get('/info', (request, response) => {
  Person
    .find({})
    .then(result => {
      response.status(200).setHeader('content-type', 'text/html').send(`<div><p>Phonebook has info for ${result.length} people</p><p>${new Date()}</p></div>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  console.log('ID received for post ', id)
  Person
    .findById(id)
    .then(result => {
      console.log('Person received from db ', result)
      return response.status(200).json(result)
    })
    .catch(error => {
      console.log('Error message from db ', error.message)
      next(error)
    })
})

app.post('/api/persons', morgan(':method :url :status :res[content-length] - :response-time ms :body :date'), (request, response, next) => {
  const body = request.body
  console.log('New person content ', body)
  const name = body.name
  const number = body.number
  if(body){
    Person
      .findOne({ 'name': name })
      .then(result => {
        if(result){
          return response.status(400).json({ 'error': 'Person must be unique' })
        }

        if(!result && name && number){
          const person = new Person({
            name,
            number,
          })
          person
            .save()
            .then(result => {
              console.log('Person saved ', result)
              return response.status(200).json(person)
            })
            .catch(error => {
              console.log('Saving error ', error.message)
              next(error)
            })
        }
        else {
          return response.status(400).json({ 'error':'Name and or number cannot be empty' })
        }
      })
      .catch(error => {
        next(error)
      })
  }
  else {
    return response.status(400).json({ 'error': 'No data received' })
  }
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  if(id) {
    Person
      .findByIdAndDelete(id)
      .then(result => {
        console.log('Found and deleted ', result)
        return response.status(200).end()
      })
      .catch(error => {
        console.log('Unsuccessful deletion ', error.message)
        next(error)
      })
  }
  else {
    return response.status(404).end()
  }
})

app.put('/api/persons/:id', morgan(':method :url :status :res[content-length] - :response-time ms :body :date'), (request, response, next) => {
  const id = request.params.id
  const body = request.body
  console.log('Details received from frontend ', body)
  const name = body.name
  const number = body.number
  if(id && name && number) {
    Person
      .findOneAndUpdate({ _id: id }, { name, number }, { new: true, runValidators: true })
      .then(result => {
        console.log('Result from db ', result)
        return response.status(200).json(result)
      })
      .catch(error => {
        next(error)
        return response.status(400).end()
      })
  }
  else return response.status(400).end()
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})