var app = angular.module('timesquad', []);

var cardFactory = {
	card : {
		name : "Giant Rat",
		hp : 10,
		str : 5,
		reverse : false,

		onDeath : function(pile, player) {

		},

		onFlip : function(pile, player) {

		}, 

		onPlayerAction : function(pile, player) {

		}
	},

	get : {
		card : null,
		spikeball : function getSpikeBall (reverse) {
				var out = Object.create(cardFactory.card);
				out.name = 'Spike Ball';
				out.hp = 15;
				out.str = 5;
				out.onFlip = function(pile, player) {
					player.hp -= 5;
				};

				out.onPlayerAction = function(pile, player) {
					this.hp -= player.atk;	
					if(this.hp <= 0) {
						pile.removeCard(this);
					}
				};

				out.reverse = reverse;
				return out;
		},

		rat : function getRat (reverse) {
				var out = Object.create(this.card);
				out.onPlayerAction = function(pile, player) {
					console.log(player);
					this.hp -= player.atk;	
					if(this.hp <= 0) {
						pile.removeCard(this);
					}
				};
				out.image = 'rat.jpg';
				out.reverse = reverse;
				return out;
		},

		mother : function getMotherRat (reverse) {
				var out = Object.create(this.rat());
				out.name = 'Mother Rat';
				out.onDeath = function(pile, player) {
					var table = pile.table;
					for(var i = 0; i < 1; i++) {
						var newPile = table.addPile();
						newPile.addCard(cardFactory.get.rat(false));

					}
					
				}

				out.onPlayerAction = function(pile, player) {
					console.log(player);
					this.hp -= player.atk;	
					if(this.hp <= 0) {
						this.onDeath(pile, player);
						pile.removeCard(this);
					}
				};

				out.reverse = reverse;
				return out;
		}

	}
}

cardFactory.get.card = cardFactory.card;


var DM = {
	name : 'DM',
	onTurn : function(table) {
		if(table.piles.length < 3) {
			table.addPile();
			
		}
		for (var i = table.piles.length - 1; i >= 0; i--) {
			table.piles[i].addCard(cardFactory.get.spikeball(true));
			table.piles[i].addCard(cardFactory.get.mother(false));
		};
		table.nextTurn();
	}
};

function CardPile (CardTableService) {
	this.table = CardTableService;
	this.cards = [];

	this.addCard = function (card) {				
		this.cards[this.cards.length] = Object.create(card); 
	};

	this.removeCard = function(card) {
		this.cards.splice(this.cards.indexOf(card), 1);
		if(this.cards.length > 0) {
			var nextCard = this.cards[this.cards.length - 1];
			if(nextCard.reverse) {
				nextCard.reverse = false;
				console.log('WHAT', this.table.currentPlayer)
				nextCard.onFlip(this, this.table.currentPlayer);
			}
		} else {
			this.table.piles.splice(this.table.piles.indexOf(this), 1);
		}
	}
}

app.service('CardTableService',  function(){
	return {
		piles : [],
		players : [DM],
		currentPlayerIdx : -1,
		currentPlayerName : '',
		nextTurn: function() {
			this.currentPlayerIdx = (this.currentPlayerIdx + 1) %  this.players.length;
			this.currentPlayerName = this.players[this.currentPlayerIdx].name;
			this.currentPlayer = this.players[this.currentPlayerIdx];
			if('onTurn' in this.currentPlayer) {
				this.currentPlayer.onTurn(this);
			}
		},
		addPile: function() {
			this.piles[this.piles.length] = new CardPile(this);
			return this.piles[this.piles.length - 1];
		},
		nextPlayerName :  function() {
			return this.players[ (this.currentPlayerIdx + 1) %  this.players.length].name;
		}
}
});

app.directive('dm',  function(CardTableService){
	// Runs during compile
	return {
		scope: {},
		restrict : 'E',
		replace : true,
	 	templateUrl: 'tmpl/dm.html',
		link: function($scope, iElm, iAttrs, controller) {
			$scope.currentPlayerName = '';
			$scope.nextTurn = function() {
				CardTableService.nextTurn();
				$scope.currentPlayerName = CardTableService.currentPlayerName;
			};
		}	
	};
});


app.directive('player',  function(CardTableService){
	// Runs during compile
	return {
		scope: {},
		restrict : 'E',
		replace : true,
	 	templateUrl: 'tmpl/player.html',
		link: function($scope, iElm, iAttrs, controller) {
			CardTableService.players[CardTableService.players.length] = ($scope);
			$scope.hp = 30;
			$scope.atk = 3;
			$scope.name = 'player';
		}	
	};
});


app.directive('card',  function(CardTableService){
	// Runs during compile
	return {
		replace: true,
		templateUrl: 'tmpl/card.html',
		restrict: 'E',
		link: function($scope, iElm, iAttrs, controller) {

			$scope.playerTrigger = function(card) {	
				console.log($scope);
				if(CardTableService.currentPlayer.name === 'DM') return;
				card.onPlayerAction($scope.$parent.pile, CardTableService.currentPlayer);
			}
		}
	};
});


app.directive('cardTable',  function(CardTableService){
	// Runs during compile
	return {
		replace: true,
		templateUrl: 'tmpl/card-table.html',
		restrict: 'E',
		link: function($scope, iElm, iAttrs, controller) {
			$scope.table = CardTableService;
		}
	};
});

app.directive('cardPile',  function(CardTableService){
	// Runs during compile
	return {
		replace: true,
		scope: true,
		templateUrl: 'tmpl/card-pile.html',
		restrict: 'E',
		link: function($scope, iElm, iAttrs, controller) {
			$scope.pile = $scope.$parent.pile;
			$scope.cards = $scope.$parent.pile.cards;
		}
	};
});