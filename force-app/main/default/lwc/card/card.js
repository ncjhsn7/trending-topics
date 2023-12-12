import { LightningElement, api, track } from 'lwc';
import findProductsVotes from '@salesforce/apex/TrendingController.findProductsVotes';
import saveUserVote from '@salesforce/apex/TrendingController.saveUserVote';
import getProductComments from '@salesforce/apex/TrendingController.getProductComments';
import createProductComment from '@salesforce/apex/TrendingController.createProductComment';
import deleteProductComment from '@salesforce/apex/TrendingController.deleteProductComment';

export default class Card extends LightningElement {
    @api recordId;
    @api product = {};
    @api parent;
    @api index;

    @api showTrending = 'true';

    get getShowTrending(){
        return this.showTrending == 'true';
    }

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
            if(e.key == 'Enter' && this.modalConfig.showModal == true && this.newComment)
                this.insertComment();

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

        let currentA =  this.currentVote == 'UP' ? 'ND' : 'UP'

        if(this.currentVote == 'UP'){
            this.currentVote = null;
            this.votes -= 1;
        } else {
            this.currentVote = 'UP';
            this.votes += 1;
        }

        console.log('current up vote: ', currentA)

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

    }
    handleDownVote(){
        console.log('downVote');

        let currentA =  this.currentVote == 'DOWN' ? 'ND' : 'DOWN'

        if(this.currentVote == 'DOWN'){
            this.currentVote = null;
            this.votes += 1;
        } else {
            this.currentVote = 'DOWN';
            this.votes -= 1;
        }

        console.log('current down vote: ', currentA)

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

    get getFavoriteStroke(){
        return this.areFavorited ? '#0094d9' : '#000000'
    }

    get getFavoriteFill(){
        return this.areFavorited ? '#0094d9' : 'none'
    }



    get getDeslikeFill(){
        return this.currentVote == 'DOWN' ? '#f84343' : '#000000'
    }
    get getDeslikeStroke(){
        return this.currentVote == 'DOWN' ? '#f84343' : '#000000'
    }

    get getLikeFill(){
        return this.currentVote == 'UP' ? '#52ff52' : '#000000'
    }
    get getLikeStroke(){
        return this.currentVote == 'UP' ? '#52ff52' : '#000000'
    }

    get getDeslikeOpacity(){
        return this.currentVote == 'DOWN' ? 1 : 0;
    }

    get getLikeOpacity(){
        return this.currentVote == 'UP' ? 1 : 0;
    }



    get dissableUpVote(){
        return this.currentVote == 'UP';
    }

    get dissableDownVote(){
        return this.currentVote == 'DOWN';
    }

    openModal(){
        this.modalConfig.showModal = true;

        this.runGetComments();
    }
    

    runGetComments(){

        this.modalConfig.isLoading = false;
        this.modalConfig.isInsertCommentLoading = true;

        getProductComments({
            product: this.recordId
        })
        .then(res => {
            console.log(JSON.parse(res));
            this.comments = JSON.parse(res);
        })
        .catch(err => {
            console.log('err: ', err)

        })
        .finally(()=>{
            // this.modalConfig.isLoading = false;
            this.modalConfig.isInsertCommentLoading = false;
        })

    }

    @track newComment = '';

    @track comments = [];

    handleInputChange(event) {
        this.newComment = event.detail.value;
    }

    insertComment(event){

        if(!this.newComment) return;

        this.modalConfig.isInsertCommentLoading = true;

        createProductComment({
            product: this.recordId,
            comment: this.newComment
        })
        .then(res => {
            console.log('foi');
        })
        .catch(err => {
            console.log('err: ', err);
        })
        .finally(()=>{
            this.newComment = '';
            this.runGetComments();
        })


    }

    deleteComment(event){
        const comment = event.target.dataset.value;

        console.log(comment);

        this.modalConfig.isInsertCommentLoading = true;

        deleteProductComment({
            product: comment
        })
        .then(res => {
            console.log('foi');

        })
        .catch(err => {
            console.log('err: ', err);

        })
        .finally(()=>{
            this.runGetComments();
        })
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
            isInsertCommentLoading: false,
            message: '',
            rejectLabel: 'Voltar'
        };
    }

    closeModal(){
        this.setModalConfigToDefault();
    }
}