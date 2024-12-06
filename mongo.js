const mongoose = require('mongoose')

if (process.argv.length<5) {
  console.log('give password, name and number as arguments')
  process.exit(1)
}

const password = process.argv[2]
const personName = process.argv[3]
const personNumber = process.argv[4]

const url =
  `mongodb+srv://iconios123:${password}@passportauthlearning.5dien.mongodb.net/?retryWrites=true&w=majority&appName=PassportAuthLearning`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if(!personName && !personNumber){
  console.log('Phonebook: ')
  Person
    .find({})
    .then(persons => {
      persons.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
}

if(personName && personNumber) {
  const person = new Person({
    name: personName,
    number: personNumber,
  })

  person
    .save()
    .then(() => {
      console.log(`Added ${personName} ${personNumber} to phonebook`)
      mongoose.connection.close()
    })
}