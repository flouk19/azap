import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { Votes } from '../../api/votes.js';
import { VoteResponses } from '../../api/voteresponses.js';
import { Restaurants } from '../../api/restaurants.js';

import template from './voteComp.html';

class VoteCompCtrl {
    constructor($scope) {
        $scope.viewModel(this);
        this.subscribe('Meteor.users.names');
        this.subscribe('runningVote');
        this.subscribe('restaurants');

        this.positive = {
            positive: true
        };
        this.negative = {
            positive: false
        };
        this.other = {
            positive: false
        };
        this.responseVal = this.positive;
        this.voteId;
        this.helpers({
            runningVote(){
                var vote =  Votes.findOne({ finished:{ $eq: false } });
                if(vote){
                    var restaurant = Restaurants.findOne({ _id:{$eq:vote.restaurant}});
                    var voteRest = {
                        vote: vote,
                        restaurant: restaurant
                    };
                    this.positive.restaurantId = vote.restaurant;
                    this.voteId = vote._id;
                    return voteRest;
                }
            },
            currentUser(){
                return Meteor.user();
            },
            voteAnswered(){
                var vote =  Votes.findOne({ finished: false });
                if(vote){
                    var response = VoteResponses.findOne({
                        $and:[{
                                voter: Meteor.userId()
                            }, {
                                voteId: vote._id
                            }]
                    });
                    return response;
                }
                return true;
            },
            voteOwner(){
                var vote = Votes.findOne({ finished: false });
                if(vote && vote.owner === Meteor.userId()){
                    return true;
                }
                return false;
            }
        });
    }

    respondVote(response, voteRest){
        //if its positive and the restaurantid is not set or its different from the runningvote's one
        if(!response.positive && (!response.restaurantId || response.restaurantId !== voteRest.restaurant._id) ){
            //Try to insert first to avoid the need of searching twice
            Meteor.call('restaurants.insert', response.restaurant);
            var restaurant = Restaurants.findOne({ name: {$eq:response.restaurant}});
            response.restaurantId = restaurant._id;
        }
        Meteor.call('voteResponses.insert',
            voteRest.vote._id, response.positive, response.restaurantId);
        response.restaurantId = undefined;
        response.restaurant = undefined;
    }

    finishVote(vote){
        if(vote)
            Meteor.call('votes.setFinished', vote._id, true);
    }
    removeVote(vote){
        if(vote)
            Meteor.call('votes.remove', vote._id);
    }
}
export default angular.module('voteComp', [
    angularMeteor
])
    .component('voteComp', {
        templateUrl: 'imports/components/voteComp/voteComp.html',
        controller: VoteCompCtrl
    });
