import angular from 'angular';
import 'angular-filter';
import angularMeteor from 'angular-meteor';
//import todosList from '../imports/components/todosList/todosList';
import addVote from '../imports/components/vote/addVote';
import voteComp from '../imports/components/voteComp/voteComp';
import vote from '../imports/components/vote/vote';
import voteResult from '../imports/components/vote/voteResult';
import '../imports/startup/accounts-config.js';
import '../imports/other/angular-bootstrap-datetimepicker-directive.js';
import Chart from 'chart.js/src/chart.js';
import chartjs from 'angular-chart.js';

angular.module('simple-todos', [
  angularMeteor,
  'angular.filter',
  'datetimepicker',
  vote.name,
  'accounts.ui',
  voteComp.name,
  addVote.name,
  voteResult.name,
  'chart.js'
]);

function onReady() {
    angular.bootstrap(document, ['simple-todos']);
}

if(Meteor.isCordova){
    angular.element(document).on('deviceready', onReady);
}else{
    angular.element(document).ready(onReady);
}
