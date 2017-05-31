import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Restaurants = new Mongo.Collection('restaurants');

if( Meteor.isServer ){
    Meteor.publish('restaurants', function restaurantPublication(){
        return Restaurants.find({});
    });
}
Meteor.methods({
    'restaurants.insert' (name) {
        check(name, String);
        //make sure the user is logged in before inserting a restaurant
        if(!Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }
        //Check if there is already a vote running
        const restaurant = Restaurants.findOne({name: {$eq: name}});
        if(!restaurant){
            Restaurants.insert({
                createdAt: new Date(),
                name: name,
                creator: Meteor.userId(),
            });
        }else{
            throw new Meteor.Error('This restaurant already exists');
        }
    },
    'restaurants.remove' (restaurantId) {
        check(restaurantId, String);
        // If the task is private, make sure only the owner can delete it
        Restaurants.remove(restaurantId);
    },

    'restaurants.updateName' (restaurantId, newName){
        check(restaurantId, String);
        check(newName, String);
        Restaurants.update(restaurantId, {
            $set:{
                name: newName
            }
        });
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
