

const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()


const Person = require('./models/person')

const morgan = require('morgan')
app.use(cors())
app.use(express.json())
app.use(express.static('build'))



let persons = [
]

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const date = new Date();
    Person.find({}).then(persons => {
        console.log(persons.length, date)
        response.json(`Phonebook has info for ${persons.length} people ${date}`)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body

    Person.findByIdAndUpdate(request.params.id, {name, number}, { new: true, runValidators: true, context: 'query' })
        .then(updatedNum => {
            response.json(updatedNum)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

morgan.token('body', (req) => JSON.stringify(req.body))
app.post('/api/persons', morgan(':method :url :status :res[content-length] - :response-time ms :body'), (request, response, next) => {
    const body = request.body

    const person = new Person ({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    }).catch(error => next(error))

})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }

    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})