import { Room, EntityMap, Client, nosync } from "colyseus";


export class State {
    players: EntityMap<Player> = {};

    @nosync
        playersList = [];

    ///////////////////////////////////////////////////////////////
    createPlayer (id: string) {
        this.players[ id ] = new Player();
        this.playersList.push(id);
    }

    removePlayer (id: string) {
        delete this.players[ id ];
        this.playersList.splice( this.playersList.indexOf(id), 1 );
    }
    newGame(){
        this.randomCards();
    }
    movePlayer (id: string, movement: any) {
        if (movement.x) {
            this.players[ id ].x += movement.x * 10;

        } else if (movement.y) {
            this.players[ id ].y += movement.y * 10;
        }
    }
    
    randomCards() {
        var cards:number[] = new Array(52);
        for(var i = 0 ; i < 52 ; ++i){
           cards[i] = i;
        }
        //   console.log(this.playersList.length);
        //   console.log(this.players);
        for(var i = 0 ; i < 52; ++i){
            var randomIndex = Math.floor(Math.random() * cards.length);
                var val = cards[randomIndex];
                cards.splice(randomIndex, 1);
                //console.log(this.playersList.length);
            // this.players[i % num].cards.push(val);
            var playerCard = this.players[this.playersList[i % this.playersList.length]].cards;
            if (playerCard.length < 13)
            {
                playerCard.push(val);
            }
        }
    }
    getPlayerCards(id){
        // var val= this.players[id].cards.toString();
        // console.log(val);
        return this.players[id].cards;

    }
    resetGame(){
        for(var i = 0; i < this.playersList.length ; ++i)
        {
            this.players[this.playersList[i]].cards = [];
        }
    }
}

export class Player {
    x = Math.floor(Math.random() * 400);
    y = Math.floor(Math.random() * 400);
    temp =0;
    cards = [];
}

export class StateHandlerRoom extends Room<State> {
    maxClients = 4
    onInit (options) {
        console.log("StateHandlerRoom created!", options);
        this.setState(new State());
    }

    onJoin (client) {
        console.log("new player join")
        this.state.createPlayer(client.sessionId);
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onMessage (client, data) {
        console.log("StateHandlerRoom received message from", client.sessionId, ":", data);
        if(data =='newgame')
        {
            this.state.resetGame();
            this.state.newGame();
            for(var i = 0; i < this.clients.length ; ++i) {
                this.send(this.clients[i], {"mycards":this.state.getPlayerCards(this.clients[i].sessionId)});
            }
            
        }
      
        this.state.movePlayer(client.sessionId, data);
    }

    onDispose () {
        console.log("Dispose StateHandlerRoom");
    }

}