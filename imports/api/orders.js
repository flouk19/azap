import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Orders = new Mongo.Collection('orders');

if( Meteor.isServer ){
    function publish(){

        Meteor.publish('runningOrder', function runningOrdersPublication(){
            var runningOrders = Orders.find({
                finished: {
                    $eq: false
                }
            });

            return runningOrders;
        });
        Meteor.publish('orders', function ordersPublication(){
            var orders = Orders.find();
            return orders;
        });
    }
    publish();
}
Meteor.methods({
    'orders.insert' (restaurant, ordererId) {
        check(restaurant, String);
        if(!ordererId){
            ordererId = Meteor.userId();
        }
        //make sure the user is logged in before inserting a tasks
        if(!Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }
        //Check if there is already a vote running
        const vote = Votes.findOne({finished: { $eq: false }});
        if(!vote){
            Votes.insert({
                createdAt: new Date(),
                validUntil: validDate,
                owner: Meteor.userId(),
                username: Meteor.user().username,
                allowSuggestions: allowSuggestions,
                restaurant: restaurant,
                finished: false,
            });
        }else{
            throw new Meteor.Error('only-one-running-vote-allowed');
        }
    },
    'orders.remove' (orderId) {
        check(orderId, String);
        // If the task is private, make sure only the owner can delete it
        const order = Orders.findOne(voteId);
        if(order.owner !== Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }
        Orders.remove(orderId);
    },
    'orders.setFinished' (orderId, setFinished){
        check(orderId, String);
        check(setFinished, Boolean);
        const order = Orders.findOne(orderId);
        if (order.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error('not-authorized');
        }
        Orders.update(orderId, {
            $set: {
                finished: setFinished
            }
        });
    },
    //If the order should accept no more requests
    'orders.setOrdered' (orderId, setOrdered){
        check(orderId, String);
        check(setOrdered, Boolean);
        const order = Orders.findOne(orderId);
        if(order.owner !== Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }
        Orders.update(orderId, {
            $set:{
                ordered: setOrdered
            }
        });
    }
});
