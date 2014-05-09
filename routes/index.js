module.exports = function Route(app){
  app.get('/', function(req, res){
    res.render('index', {title: 'Group Chat', session_id: req.sessionID});
  });

  users = [];
  messages = [];
  rooms = [];
  users['general'] = [];
  messages['general'] = [];
  users['programmers'] = [];
  messages['programmers'] = [];
  users['artists'] = [];
  messages['artists'] = [];
  users['athletes'] = [];
  messages['athletes'] = [];
  users['plummers'] = [];
  messages['plummers'] = [];

  app.io.route('new_user', function(req){

    var User = function(name) {
      this.name = name;
      this.id = undefined;
      this.current_room = undefined;
    }

    user = new User(req.data.name);

    user.id = req.sessionID;

    /// Join specified room ///
    current_room = req.data.room;

    user.current_room = current_room;

    req.io.join(current_room);

    users[current_room].push(user);

    // console.log(users);
    // users.push(user);

    /// Show new user in room list ///
    req.io.room(current_room).broadcast('show_new_user', user);

    /// Show existing users in room to new user ///
    req.io.emit('existing_users', users[current_room]);

    /// Show existing messages in room to new user ///
    req.io.emit('existing_messages', messages[current_room]);
  })

  app.io.route('new_message', function(req){

    user_room = req.data.room;
    content = req.data.message;
    name = req.data.name;
    message = {message: content, name: name};

    messages[user_room].push(message);

    app.io.room(user_room).broadcast('updated_message', message);
  })

  app.io.route('disconnect', function(req){
    // console.log('##########Disconnected#########', req);

    console.log('####before', users);

    for(var prop in users )
    {
      room = users[prop];
      // console.log('users[prop]', users[prop])
      for(var user in room)
      {
        // console.log(room[user].id);
        if(room[user].id == req.sessionID)
        {
          disconnected_name = room[user].name
          disconnected_user = {id: room[user].id, name: disconnected_name}
          console.log('indexOf', users.indexOf(users[prop][user]));
          var splice_index = users[prop].indexOf(room[user]);
          // console.log('users[prop][user]', users[prop][user]);
          // console.log('users[prop]', users[prop]);

          req.io.room(users[prop][user].current_room).broadcast('disconnect_user', disconnected_user )

          users[prop].splice(splice_index, 1);

        }
      }
    }
    console.log('####after', users);
    
    
  });


}
