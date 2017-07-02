import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { Votes } from '../../api/votes.js';
import { VoteResponses } from '../../api/voteresponses.js';
import { Restaurants } from '../../api/restaurants.js';

import template from './voteResult.html';

class VoteResultCtrl {
    constructor($scope) {
        $scope.viewModel(this);
        this.subscribe('Meteor.users.names');
        this.subscribe('runningVote');
        this.subscribe('restaurants');
        this.subscribe('voteResponses');
        Chart.defaults.global.elements.arc.borderColor = '#FFC38E';
        Chart.defaults.global.elements.arc.borderWidth = 18;
        Chart.defaults.global.tooltips.displayColors = false;
        $scope.labels = ["Yes", "No"];
        $scope.colors = [
            "#47B219", //paprika-green(Y)
            "#DA290B", //tomato-red(N)
            "#FFD445", //cheese-yellow
            "#A82E1D", //salami-darkred
            "#DEC980", //champignon-brown

        ]//["#52B3D9","#ABB7B7"];
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
                    //this.positive.restaurantId = vote.restaurant;
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
                var pos = this.findVoteResults(1);
                var posCnt = 0;
                if(pos){
                    posCnt = pos.count();
                }
                var neg = this.findVoteResults(0);
                var negCnt = 0;
                if(neg){
                    negCnt = neg.count();
                }
                return [posCnt, negCnt];
            },
            posVoteResponses(){
                return this.findVoteResults(1);
            },
            negVoteResponses(){
                return this.findVoteResults(0);
            },
            otherVoteResponses(){
                return this.findVoteResults(-1);
            },
            allVoteResponses(){
                return this.findVoteResults();
            },

        });
    }

    finishVote(vote){
        if(vote)
            Meteor.call('votes.setFinished', vote._id, true);
    }
    removeVote(vote){
        if(vote)
            Meteor.call('votes.remove', vote._id);
    }

    removeVoteResponse(vote){
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
            if(!response){
                throw new Meteor.Error('There is no response on this vote');
            }
            Meteor.call('voteResponses.remove', response._id);
            //TODO respones is not defined
        }
    }

    findVoteResults(opinion){
        var vote = Votes.findOne({
            finished:{
                $eq: false
            }
        });

        if(vote){
            var selectors = [];
            var selector = {};
            //if positiv is not set, return all
            selectors.push({ voteId: vote._id });
            if(typeof opinion !== 'undefined')
            {
                //1 means positive result
                if(opinion === 1){
                    selectors.push({restaurantId:{$eq: vote.restaurant}});
                //0 means No
                }else if(opinion === 0){
                    selectors.push({restaurantId: {$exists: false}});
                //-1 means different opinion
                }else if(opinion === -1){
                    selectors.push({
                        restaurantId: {$exists: true, $ne: vote.restaurant, $ne: null}
                    });
                }
            }
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
export default angular.module('voteResult', [
    angularMeteor
])
    .component('voteResult', {
        templateUrl: 'imports/components/vote/voteResult.html',
        controller: VoteResultCtrl
    });
