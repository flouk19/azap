import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Votes = new Mongo.Collection('votes');

if( Meteor.isServer ){
    function publish(){

        Meteor.publish('runningVote', function runningVotePublication(){
            var runningVotes = Votes.find({
                // validUntil: {
                //      $gt: new Date()
                // }
                finished: {
                    $eq: false
                }
            });

            return runningVotes;
        });
        Meteor.publish('votes', function votesPublication(){
            var votes = Votes.find();
            return votes;
        });
    }
    publish();
}
Meteor.methods({
    'votes.insert' (restaurant, validDate, allowSuggestions) {
        check(validDate, Date);
        check(restaurant, String);
        check(allowSuggestions, Boolean);
        //make sure the user is logged in before inserting a tasks
        if(!Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }
        //Check if there is already a vote running
        const vote = Votes.findOne({finished: { $eq: false }});
        if(!vote){
            //var result = //doesnt work like this
            Votes.insert({
                createdAt: new Date(),
                validUntil: validDate,
                owner: Meteor.userId(),
                username: Meteor.user().username,
                allowSuggestions: allowSuggestions,
                restaurant: restaurant,
                finished: false,
            });
            //return result;
        }else{
            throw new Meteor.Error('only-one-running-vote-allowed');
        }
    },
    'votes.remove' (voteId) {
        check(voteId, String);
        // If the task is private, make sure only the owner can delete it
        const vote = Votes.findOne(voteId);
        if(vote.owner !== Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }
        Votes.remove(voteId);
    },
    'votes.setFinished' (voteId, setFinished){
        check(voteId, String);
        check(setFinished, Boolean);
        const vote = Votes.findOne(voteId);
        if (vote.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error('not-authorized');
        }
        Votes.update(voteId, {
            $set: {
                finished: setFinished
            }
        });
    },
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
