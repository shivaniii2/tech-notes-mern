

const Note = require('../Models/Note')
const User = require('../Models/User')
const asyncHandler = require('express-async-handler')


const getAllNotes = asyncHandler(async( req, res) =>{
    const notes = await Note.find().lean()
    if(!notes){
      return  res.status(400).json({message : "No notes found"})
    }
    
     return res.status(200).json(notes)
    
})

const updateNote = asyncHandler(async(req, res) =>{
    const{user , id , title , text , completed}  = req.body
    
    // validate the data coming for update
    if(!id || !user || !title || !text || typeof completed !== "boolean"){
        return  res.status(400).json({message : "All Fields are important"})
    }
    
    // check for the note to update
    
    const note = await Note.findById(id).exec()
    if(!note){
        return  res.status(400).json({message : "Note not found"})
    }
    
    //  so if there are two notes with same title and you want to rename one of them (you are currently working with) then you have to check if the id of the note(whose name you want to change ) is the id you have in req body so that you are not renaming other note with the same title :)
    
    const noteTitle = await Note.findOne({title}).lean().exec()
    if(noteTitle && noteTitle._id.toString() !== id ){
        return res.status(409).json({ message: 'Duplicate note title' })
    }
    note.user = user
    note.title = title
    note.text = text
    note.completed = completed
    
    await note.save()
    return res.json({message : 'note updated'})
})


const deleteNote = asyncHandler(async(req, res) =>{
    const{id} = req.id;

    if(!id){
        return res.status(400).json({ message: 'id field is required to delete a specific note' })
    }
    
    //check if note we want to delete exists in db ?
    
    const note = Note.findById(id).exec();
    if(!note){
        return res.status(400).json({ message: 'Note does not exist in db ' })
    }
    
    const result = await note.deleteOne()
    
    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    return res.json(reply)
})

const createNote = asyncHandler(async(req, res) =>{
    const {user , title ,text  } = req.body
    
    // validate data
    if(!user || !title || !text){
        return res.status(400).json({message : "All fields are required"})
    }
    
    // check for duplicate note titles
    const duplicate = await Note.findOne({title}).lean().exec();
    if(duplicate){
        return res.status(400).json({message : "Duplicate note title"})
    }
    
    // create and store new note
    
    const note = Note.create({user , title , text})
    
    if(note){
        return res.status(200).json({message : "Note created"})
    }else{
        return res.status(400).json({message : "Invalid note data recieved"})
    }
    
    
})

module.exports = {getAllNotes , updateNote , createNote , deleteNote}