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
                var vote =  Votes.findOne({
                    finished:{
                        $eq: false
                    }
                });
                if(vote){
                    var restaurant = Restaurants.findOne({ _id:{$eq:vote.restaurant}});
                    var voteRest = {
                        vote: vote,
                        restaurant: restaurant
                    };
                    this.positive.restaurantId = restaurant._id;
                    this.voteId = vote._id;
                    return voteRest;
                }
            },
            currentUser(){
                return Meteor.user();
            },
            voteAnswered(){
                var vote =  Votes.findOne({
                    finished:{
                        $eq: false
                    }
                });
                if(vote){
                    var response = VoteResponses.findOne({
                        $and:[{
                                voter:{
                                    $eq: Meteor.userId()
                                }
                            }, {
                                voteId:{
                                    $eq: vote._id
                                }
                            }]
                    });
                    return response;
                }
                return true;
            },
            voteOwner(){
                var vote = Votes.findOne({
                    finished:{
                        $eq: false
                    }
                });
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
            allVoteResponses(){
                return this.findVoteResults();
            }
        });
    }

    respondVote(response, voteRest){
        if(response.positive && !response.restaurantId){
            //Try to insert first to avoid the need of searching twice
            Meteor.call('restaurants.insert', response.restaurant);
            var restaurant = Restaurants.findOne({ name: {$eq:response.restaurant}});
            response.restaurantId = restaurant._id;
        }
        Meteor.call('voteResponses.insert',
            voteRest.vote._id, response.positive, response.restaurantId);
    }

    finishVote(vote){
        if(vote)
            Meteor.call('votes.setFinished', vote._id, true);
    }
    removeVote(vote){
        if(vote)
            Meteor.call('votes.remove', vote._id);
    }

    findVoteResults(positive){
        var vote = Votes.findOne({
            finished:{
                $eq: false
            }
        });
            
        if(vote){
            var responses;
            //if positiv is not set, return all
            if(typeof positive === 'undefined'){
                responses = VoteResponses.find({
                    voteId:{
                        $eq: vote._id
                    }
                });
            }else{
                responses = VoteResponses.find({
                    $and:[{
                        positive:{
                            $eq: positive
                        }
                    }, {
                        voteId:{
                            $eq: vote._id
                        }
                    }]
                });
            }
            return responses;
    //TODO return the results(e.g. 5 positive, 10 negative, 3 positive but other restaurants )
        }
    }
    
    isNoVote(voteResultArray){
        if(voteResultArray && voteResultArray.length === 2 &&
            voteResultArray[0] === 0 && voteResultArray[1] === 0){
            return true;
        }
        return false;
    }
    findVoter(voterId){
        return Meteor.users.findOne({_id:{$eq: voterId}});
    }

}
export default angular.module('voteComp', [
    angularMeteor
])
    .component('voteComp', {
        templateUrl: 'imports/components/voteComp/voteComp.html',
        controller: VoteCompCtrl
    });
