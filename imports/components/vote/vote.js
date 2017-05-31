import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { Votes } from '../../api/votes.js';
import { Restaurants } from '../../api/restaurants.js';

import template from './vote.html';

class VoteCtrl {
    constructor($scope) {
        $scope.viewModel(this);
        this.subscribe('runningVote');
        this.subscribe('restaurants');
        this.subscribe('votes');

        this.helpers({
            votes() {
                const selector = {};

                // // if hide completed is checked, filter tasks
                // if(this.getReactively('hideCompleted')){
                //     selector.checked = {
                //         $ne: true
                //     };
                // }
                return Votes.find(selector,{
                    sort: {
                        createdAt: -1
                    }
                });
            },
            restaurants(){
                return Restaurants.find();
            },
            // incompleteCount(){
            //     return Tasks.find({
            //         checked: {
            //             $ne:true
            //         }
            //     }).count();
            // },
            currentUser(){
                return Meteor.user();
            },
            voteRunning(){
                return Votes.find().count() > 0;
            },

        })
    }
    removeVote(vote){
        Meteor.call('votes.remove', vote._id);
    }
    removeRestaurant(restaurant){
        Meteor.call('restaurants.remove', restaurant._id);
    }
    //
    // setPrivate(task){
    //     Meteor.call('tasks.setPrivate', task._id, !task.private);
    // }
}
export default angular.module('vote', [
    angularMeteor
])
    .component('vote', {
        templateUrl: 'imports/components/vote/vote.html',
        controller: VoteCtrl
    });
