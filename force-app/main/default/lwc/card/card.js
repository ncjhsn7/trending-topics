import { LightningElement, api, track } from 'lwc';
import findProductsVotes from '@salesforce/apex/TrendingController.findProductsVotes';
import saveUserVote from '@salesforce/apex/TrendingController.saveUserVote';
export default class Card extends LightningElement {
    @api recordId;
    @api product = {};
    @api parent;
    @api index;

    @api votes;
    @api currentVote;
    @api areFavorited;

    @track isLoading = true;

    @track isLikesLoading = true;

    get getIndex(){
        return this.index + 1;
    }


    connectedCallback(){
        this.runInit();

        document.addEventListener("keydown", (e)=> {
            console.log('key press: ' + e.key);
            if(e.key == 'Escape'){
                if(this.modalConfig.showModal)
                    this.setModalConfigToDefault();
            }
        }, false);
    }

    async runInit(){
        this.isLoading = false;
        this.runGetVotes();
    }

    runGetVotes(){
        this.isLikesLoading = true;

        findProductsVotes({
            products: [this.recordId]
        })
        .then(res => {
            const result = JSON.parse(res)[this.recordId];

            console.log('res votes: ', JSON.stringify(res));

            this.currentVote = result.currentUserVote;
            this.votes = result.votesSum;
            this.areFavorited = result.isFavorite;

        })
        .catch(err => {
            console.log('err: ', err);
        })
        .finally(()=>{
            this.isLikesLoading = false;
        })
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

        this.areFavorited = !this.areFavorited;

        let currentA =   this.areFavorited ? 'FAVORITE' : 'UNFAVORITE'

        console.log(currentA);

        saveUserVote({
            vote: currentA,
            product: this.recordId
        })
        .then(res => {
            console.log('res favoritado');
        })
        .catch(err => {
            console.log(JSON.stringify(err));
        })
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


    get getFavoriteFill(){
        return this.areFavorited ? '#0094d9' : 'none'
    }

    get dissableUpVote(){
        return this.currentVote == 'UP';
    }

    get dissableDownVote(){
        return this.currentVote == 'DOWN';
    }

    openModal(){
        this.modalConfig.showModal = true;

        
    }

    @track modalConfig = {
        showModal: false,
        isLoading: true,
        message: '',
        rejectLabel: 'Voltar'
    };

    setModalConfigToDefault(){
        this.modalConfig = {
            showModal: false,
            isLoading: true,
            message: '',
            rejectLabel: 'Voltar'
        };
    }

    closeModal(){
        this.setModalConfigToDefault();
    }
}