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
    'voteResponses.insert' (voteId, restaurantId) {
        check(voteId, String);
        //RestaurantId is not necessary as it can be null/undefined
        //make sure the user is logged in before inserting a response
        if(!Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }
        console.log(restaurantId);
        VoteResponses.upsert(
            {
                $and:[{
                        voter:{ $eq: Meteor.userId() }
                    }, {
                        voteId:{ $eq: voteId }
                    }
                ]
            },
            {
                createdAt: new Date(),
                voter: Meteor.userId(),
                restaurantId: restaurantId,
                voteId: voteId
            }
        );
    },
    'voteResponses.remove' (voteResponseId){
        check(voteResponseId, String);
        const resp = VoteResponses.findOne(voteResponseId);
        if(response.voter !== Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }
        Votes.remove(voteResponseId);
    }
});
