import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Restaurants } from './restaurants.js';

export const VoteResponses = new Mongo.Collection('voteResponses',{
    transform: (response)=>{
        var user = Meteor.users.findOne({_id:{$eq: response.voter}});
        var restaurant = Restaurants.findOne({_id:{ $eq: response.restaurantId}});
        if (user) {
            var username = user.username;
            response.username = username;
        }
        if(restaurant){
            var restname = restaurant.name;
            response.restaurant = restname;
        }
        return response;
    }
});

if( Meteor.isServer ){
    //Publish the usernames so they can be shown in the list of who voted
    Meteor.publish('Meteor.users.names', function usernamesPublication(){
        const options = {
            fields: { username: 1}
        };
        return Meteor.users.find({}, options);
    });
    Meteor.publish('voteResponses', function voteResponsesPublication(){
        return VoteResponses.find();
    });
}

Meteor.methods({
    'voteResponses.insert' (voteId, positive, restaurantId) {
        check(voteId, String);
        check(positive, Boolean);
        //Restaurant id is only needed if its a positive answer(yes i want to order at <restaurantId>)
        if(positive){
            check(restaurantId, String);
        }
        //make sure the user is logged in before inserting a response
        if(!Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }
        // The client should check if it exists
        // if(positive){
        //     const restaurant = Restaurants.findOne({_id: {$eq: restaurantId}});
        //     if(!restaurant){
        //         throw new Meteor.Error('The specified restaurant does not exist');
        //     }
        // }
        var response = VoteResponses.findOne({
            $and:[{
                    voter:{
                        $eq: Meteor.userId()
                    }
                }, {
                    voteId:{
                        $eq: voteId
                    }
                }]
        });
        if(response){
            throw new Meteor.Error('The user voted already on this question');
        }
        VoteResponses.insert({
            createdAt: new Date(),
            voter: Meteor.userId(),
            restaurantId: restaurantId,
            positive: positive,
            voteId: voteId
        })
    }
    // 'tasks.setChecked' (taskId, setChecked) {
    //     check(taskId, String);
    //     check(setChecked, Boolean);
    //     const task = Tasks.findOne(taskId);
    //     if (task.private && task.owner !== Meteor.userId()) {
    //         // If the task is private, make sure only the owner can check it off
    //         throw new Meteor.Error('not-authorized');
    //     }
    //     Tasks.update(taskId, {
    //         $set: {
    //             checked: setChecked
    //         }
    //     });
    // },
    // 'tasks.setPrivate' (taskId, setToPrivate){
    //     check(taskId, String);
    //     check(setToPrivate, Boolean);
    //     //make sure the user is logged in before inserting a tasks
    //     if(!Meteor.userId()){
    //         throw new Meteor.Error('not-authorized');
    //     }
    //     const task = Tasks.findOne(taskId);
    //     // Make sure only the task owner can make a task private
    //     if (task.owner !== Meteor.userId()) {
    //         throw new Meteor.Error('not-authorized');
    //     }
    //     Tasks.update(taskId, {
    //         $set: {
    //             private: setToPrivate
    //         }
    //     });
    // },
});
