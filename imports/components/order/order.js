import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';

import template from './order.html';

class OrderCtrl {
    constructor($scope) {
        $scope.viewModel(this);

        this.subscribe('orders');

        this.helpers({
            currentUser(){
                return Meteor.user();
            }
        })
    }

    addOrder(newOrder){
        //insert task into the collection
        Meteor.call('orders.insert', newOrder);
        //clear form
        this.newOrder = '';
    }

    removeOrder(order){
        Meteor.call('orders.remove', order._id);
    }
}
export default angular.module('order', [
    angularMeteor
])
    .component('order', {
        templateUrl: 'imports/components/order/order.html',
        controller: OrderCtrl
    });
