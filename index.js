
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const app = express();

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.use(cors());

morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('date', (req)=> new Date());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body :date'));

app.use(express.json());

app.get('/api/persons', (request, response) => {
    response.status(200).send(persons);
});

app.get('/info', (request, response) => {
    response.status(200).send(`<div><p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p></div>`);
});

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const person = persons.find(person => person.id === id);
    if(person) {
        response.status(200).json(person);
    }
    else response.status(404).send('Person not found');
})

app.post('/api/persons', (request, response) => {
    const body = request.body;    
    console.log('New person content ', body);

    const generateID = () => {
        return String(Math.floor(Math.random() * 10000) + 5);
    } 
    const alreadyPerson = persons.find(person=> person.name === body.name)
    
    if(alreadyPerson){
        return response.status(400).end('Person must be unique')
    }

    if(!body) {
        return response.status(400).end('Error. No data received')
    }

    if(!body.name) {
        return response.status(400).end('The name cannot be empty')
    }

    if(!body.number) {
        return response.status(400).end('The number cannot be empty')
    }

    if(!alreadyPerson && body.name && body.number) {
        body.id = generateID();
        persons = persons.concat(body);
        return response.status(200).json(body);
    }    
    
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    if(id) {
        const delPerson = persons.find(person=> person.id === id);
        console.log('Person to remove ', delPerson);
        if(delPerson){
            persons = persons.filter(person=> person.id !== id)
            return response.status(200).end();
        }
        else {
            return response.status(404).end();
        }
    }
    else {
        return response.status(404).end();
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
});