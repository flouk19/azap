import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { Votes } from '../../api/votes.js';
import { Restaurants } from '../../api/restaurants.js';

import template from './addVote.html';

class AddVoteCtrl {
    constructor($scope) {
        $scope.viewModel(this);
        this.subscribe('runningVote');
        this.subscribe('restaurants');

        this.helpers({

            datetimepickerOptions(){
                var todayHighNoon = new moment({hour: 12});
                var nextFullHour = new moment().add(1, 'h').startOf('h');
                var dateToUse = todayHighNoon.isBefore(nextFullHour) ?
                        nextFullHour : todayHighNoon;
                validDate = dateToUse;
                return {
                    format: 'LT',
                    inline: true,
                    locale: 'de',
                    stepping: 15,
                    defaultDate: dateToUse,
                    minDate: nextFullHour
                };
            },
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
                    return voteRest;
                }
            },
            restaurants(){
                return Restaurants.find();
            },
            currentUser(){
                return Meteor.user();
            },
            voteRunning(){
                return Votes.find().count() > 0;
            },

        })
    }

    addVote(restaurant, validDate, allowSuggestions){
        //insert task into the collection
        Meteor.call('restaurants.insert', restaurant);
        const rest = Restaurants.findOne({name:{$eq: restaurant}})
        Meteor.call('votes.insert', rest._id, validDate.toDate(), allowSuggestions);
        //clear form
        this.restaurant = '';
    }

    removeRestaurant(restaurant){
        Meteor.call('restaurants.remove', restaurant._id);
    }
}
export default angular.module('addVote', [
    angularMeteor
])
    .component('addVote', {
        templateUrl: 'imports/components/vote/addVote.html',
        controller: AddVoteCtrl
    });
