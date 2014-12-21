var DM = {
	name : 'DM',
	onTurn : function(table) {
		for (var i = table.piles.length - 1; i >= 0; i--) {

			
			table.piles[i].addCard(Object.create({
						name : "Giant Rat",
						hp : 10,
						str : 5,
						reverse : true
			}));

			table.piles[i].addCard(Object.create({
						name : "Giant Rat",
						hp : 10,
						str : 5,
						reverse : false
			}));
		
	
		};
	}
};

var app = angular.module('timesquad', []);
app.controller('table',  function($scope){
	$scope.piles  = [];
	$scope.players = [DM]
	$scope.currentPlayer = -1;
	$scope.currentPlayerName = '';
	$scope.nextTurn = function() {
		$scope.currentPlayer = ($scope.currentPlayer + 1) %  $scope.players.length;
		$scope.currentPlayerName = $scope.players[$scope.currentPlayer].name;
		if('onTurn' in $scope.players[$scope.currentPlayer]) {
			$scope.players[$scope.currentPlayer].onTurn($scope);
		}
	}
});


app.directive('player',  function(){
	// Runs during compile
	return {
		scope: {},
		restrict : 'E',
		replace : true,
	 	templateUrl: 'tmpl/player.html',
		link: function($scope, iElm, iAttrs, controller) {
			$scope.$parent.players[$scope.$parent.players.length] = ($scope);
			$scope.hp = 10;
			$scope.atk = 10;
			$scope.name = 'player';
		}	
	};
});


app.directive('card',  function(){
	// Runs during compile
	return {
		replace: true,
		templateUrl: 'tmpl/card.html',
		restrict: 'E',
		link: function($scope, iElm, iAttrs, controller) {
			$scope.playerTrigger = function(card) {	
				card.hp--;	
				if(card.hp <= 0) {
					$scope.$parent.removeCard(card);
				}
			}
		}
	};
});

app.directive('cardPile',  function(){
	// Runs during compile
	return {
		replace: true,
		scope: true,
		templateUrl: 'tmpl/card-pile.html',
		restrict: 'E',
		link: function($scope, iElm, iAttrs, controller) {
			$scope.$parent.piles[$scope.$parent.piles.length] = $scope;
			$scope.cards = [];
	
			$scope.addCard = function (card) {				
				$scope.cards[$scope.cards.length] = Object.create(card); 
			};

			$scope.removeCard = function(card) {
				$scope.cards.splice($scope.cards.indexOf(card), 1);
			}
		}
	};
});