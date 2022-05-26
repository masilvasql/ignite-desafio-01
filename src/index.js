const express = require('express');
const app = express();
const {v4:uuidV4} = require('uuid')
const cors = require('cors');

app.use(cors());
app.use(express.json())

const users = [];

function checkIfExisitsUserAccount(request, response, next){

    const {username} = request.headers;

    const user = users.find(user => user.username === username)

    if(!user){
        return response.status(404).json({error:"user not found!"})
    }

    request.user = user;

    next()
}

function checkUserNameExists(request, response, next){

    const {username} = request.body;


    const user = users.find(user => user.username === username)

    if(user){
        return response.status(400).json({error:"user Already Exists!"})
    }

    request.user = user;

    next()
}

function findTodo(todos, id){
    return todos.find(todo=> todo.id === id );
}

function updateTodo(todos, id, title, deadline){
    let todoExistis ;
    const todo = findTodo(todos, id)
    if(todo){
        todoExistis = true;
        todo.title = title;
    todo.deadline = new Date(deadline);
    }else{
        todoExistis = false;
    }

    let response = {
        todo,
        todoExistis
    }
    
    return response;
}

function deleteTodo(todos, id){
    let success = false;
    const todo = findTodo(todos, id)
    if(todo){
        todos.splice(todo, 1);
        success= true;
    }

    return success;
    
}

function doneTodo(todos, id){
    let success = false
    const todo = findTodo(todos, id);
    
    if(todo){
        success = true;
        todo.done = true;
    }

    let response = {
        todo,
        success
    }
    return response;
    
}


app.post("/users", checkUserNameExists, (request, response)=>{
    const {name, username} = request.body;
    const todos = [];

    let json = {
        name,
        username,
        id:uuidV4(),
        todos
    }

    users.push(json);

    return response.status(201).json(json)
})

app.post("/todos", checkIfExisitsUserAccount, (request, response)=>{
    const {title, deadline} = request.body;
    const {user} = request;
    const todo = {
        id:uuidV4(),
        title , 
        done:false,
        deadline:new Date(deadline),
        created_at: new Date()
    }
    
    user.todos.push(todo)

    return response.status(201).json(todo);

})

app.get("/todos", checkIfExisitsUserAccount, (request, response)=>{
    const {user} = request;
    return response.json(user.todos)
})

app.put("/todos/:id",checkIfExisitsUserAccount ,(request, response)=>{
    const {user} = request;
    const {id} = request.params;
    const {title, deadline} = request.body;
    
    
    let {todo, todoExistis} = updateTodo(user.todos, id, title, deadline);
    if(todoExistis){
        return response.status(201).json(todo)
    }else{
        return response.status(404).json({
            error:"Todo not found"
        })
    }

  

})

app.patch("/todos/:id/done", checkIfExisitsUserAccount ,(request, response)=>{
    const {user} = request;
    const {id} = request.params;

    let {todo, success} = doneTodo(user.todos,id);

    if(success){
        return response.status(200).json(todo)
    }else{
        return response.status(404).json({
            error:"Todo not found"
        })
    }

})

app.delete("/todos/:id", checkIfExisitsUserAccount, (request, response)=>{
    const {user} = request;
    const {id} = request.params;

    let success = deleteTodo(user.todos, id);
    if(success){
        return response.status(204).send()
    }else{
        return response.status(404).json({
            error:"Todo not found"
        })
    }
   
})

module.exports = app;
