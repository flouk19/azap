import angular from 'angular';
import 'angular-filter';
import angularMeteor from 'angular-meteor';
//import todosList from '../imports/components/todosList/todosList';
import addVote from '../imports/components/vote/addVote';
import voteComp from '../imports/components/voteComp/voteComp';
import vote from '../imports/components/vote/vote';
import voteResult from '../imports/components/vote/voteResult';
import order from '../imports/components/order/order';
import '../imports/startup/accounts-config.js';
import '../imports/other/angular-bootstrap-datetimepicker-directive.js';
import Chart from 'chart.js/src/chart.js';
import chartjs from 'angular-chart.js';

angular.module('vote-azap', [
  angularMeteor,
  'angular.filter',
  'datetimepicker',
  'accounts.ui',
  vote.name,
  voteComp.name,
  addVote.name,
  voteResult.name,
  order.name,
  'chart.js'
]);

function onReady() {
    angular.bootstrap(document, ['vote-azap']);
}

if(Meteor.isCordova){
    angular.element(document).on('deviceready', onReady);
}else{
    angular.element(document).ready(onReady);
}
