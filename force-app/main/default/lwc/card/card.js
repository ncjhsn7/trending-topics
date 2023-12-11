import { LightningElement, api, track } from 'lwc';

export default class Card extends LightningElement {
    @api recordId;
    @api votes;
    @api currentVote;
    @api areFavorited;

    @track isLoading = true;

    @api parent;
    
    connectedCallback(){
        this.runInit();
    }

    async runInit(){
        this.isLoading = false;
    }

    runGetVotes(){

    }

    handleUpVote(){
        console.log('upVote');

        return false;

        if(this.currentVote == 'UP'){
            this.currentVote = null;
            this.votes -= 1;
        } else {
            this.currentVote = 'UP';
            this.votes += 1;
        }

        this.sendVote();
    }
    handleDownVote(){
        console.log('downVote');
        return false;

        if(this.currentVote == 'DOWN'){
            this.currentVote = null;
            this.votes += 1;
        } else {
            this.currentVote = 'DOWN';
            this.votes -= 1;
        }

        this.sendVote();
    }

    handleFavorite(){
        console.log('onFavorite');
        return false;

        this.areFavorited = this.areFavorited ? false : true;


        console.log('are favorite: ' + this.areFavorited);
    }

    sendVote(){
        this.isLoading = true;

        updateVote({
            recordId: this.recordId,
            vote: this.currentVote
        })
        .then(res => {
            console.log('res updateVote: ' + JSON.stringify(res));
        })
        .catch(err => {
            console.log('err updateVote: ' + JSON.stringify(err));
        })
        .finally(()=>{
            this.isLoading = false;
        })
    }

    openModal(){
        console.log('open modal');
    }

    get dissableUpVote(){
        return this.currentVote == 'UP';
    }

    get dissableDownVote(){
        return this.currentVote == 'DOWN';
    }
}