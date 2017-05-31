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
        this.subscribe('voteResponses');
        $scope.labels = ["Yes", "No"];
        $scope.colors = ["#52B3D9","#ABB7B7"];

        this.positive = {
            positive: true
        };
        this.negative = {
            positive: false
        };
        this.other = {
            positive: true
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
            },
            voteResults(){
                var pos = this.findVoteResults(true);
                var posCnt = 0;
                if(pos){
                    posCnt = pos.count();
                }
                var neg = this.findVoteResults(false);
                var negCnt = 0;
                if(neg){
                    negCnt = neg.count();
                }
                return [posCnt, negCnt];
            },
            posVoteResponses(){
                return this.findVoteResults(true, true);
            },
            negVoteResponses(){
                return this.findVoteResults(false);
            },
            otherVoteResponses(){
                return this.findVoteResults(true, false);
            },
            allVoteResponses(){
                return this.findVoteResults();
            },

        });
    }
//TODO doesnt work because of digest
    randomOtherRestaurantText(restaurantName){
        var texts = ["These guys want to order at "+restaurantName,
        "They don't like your idea, they like "+restaurantName,
        "I don't wanna, I want "+restaurantName,
        "Sorry dude, but I think "+restaurantName+" is nicer"
        ];
        var random = Math.floor((Math.random() * texts.length));
        return texts[random];
    }

    respondVote(response, voteRest){
        //if its positive and the restaurantid is not set or its different from the runningvote's one
        if(response.positive && (!response.restaurantId || response.restaurantId !== voteRest.restaurant._id) ){
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

    findVoteResults(positive, voteRestaurantOnly){
        var vote = Votes.findOne({
            finished:{
                $eq: false
            }
        });

        if(vote){
            var responses;
            var selectors = [];
            var selector = {};
            //if positiv is not set, return all
            selectors.push({ voteId: vote._id });
            if(typeof positive !== 'undefined')
            {
                selectors.push({positive: positive});
            }
            //if voteRestaurantOnly is true, only the restaurant specified in the running vote
            // will be returned
            if(voteRestaurantOnly === true){
                selectors.push({restaurantId:{$eq: vote.restaurant}});
                //if its false, only the restaurants which are NOT specified in the running vote are returned
            }else if (voteRestaurantOnly === false){
                selectors.push({restaurantId:{$ne: vote.restaurant}});
            }
            //only if voteRestaurantOnly is not defined all restaurants are returned

            if(selectors.length===1){
                selector = selectors[0];
            }else if(selectors.length >=1){
                selector = {
                    $and: selectors
                };
            }
            return VoteResponses.find(selector);
        }
    }

    isNoVote(voteResultArray){
        if(voteResultArray && voteResultArray.length === 2 &&
            voteResultArray[0] === 0 && voteResultArray[1] === 0){
            return true;
        }
        return false;
    }

}
export default angular.module('voteComp', [
    angularMeteor
])
    .component('voteComp', {
        templateUrl: 'imports/components/voteComp/voteComp.html',
        controller: VoteCompCtrl
    });
