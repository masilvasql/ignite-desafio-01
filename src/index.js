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
        return response.status(400).json({error:"user not found!"})
    }

    request.user = user;

    next()
}

function findTodo(todos, id){
    return todos.find(todo=> todo.id === id );
}

function updateTodo(todos, id, title, deadline){
    const todo = findTodo(todos, id)
    todo.title = title;
    todo.deadline = new Date(deadline);
}

function deleteTodo(todos, id){
    const todo = findTodo(todos, id)
    todos.splice(todo, 1);
}

function doneTodo(todos, id){
    const todo = todos.find(todo=> todo.id === id );
    todo.done = true;
}


app.post("/users", (request, response)=>{
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
    user.todos.push({
        id:uuidV4(),
        title , 
        done:false,
        deadline:new Date(deadline),
        created_at: new Date()
    })

    return response.status(201).json(user.todos);

})

app.get("/todos", checkIfExisitsUserAccount, (request, response)=>{
    const {user} = request;
    return response.json(user.todos)
})

app.put("/todos/:id",checkIfExisitsUserAccount ,(request, response)=>{
    const {user} = request;
    const {id} = request.params;
    const {title, deadline} = request.body;

    updateTodo(user.todos, id, title, deadline);

    response.status(201).json(user.todos)

})

app.patch("/todos/:id/done", checkIfExisitsUserAccount ,(request, response)=>{
    const {user} = request;
    const {id} = request.params;
 
    doneTodo(user.todos,id);

    response.status(201).json(user.todos)

})

app.delete("/todos/:id", checkIfExisitsUserAccount, (request, response)=>{
    const {user} = request;
    const {id} = request.params;

    deleteTodo(user.todos, id);

    return response.status(200).json(user.todos)
})

module.exports = app;
