import { LightningElement, api } from 'lwc';

export default class Ilustrator extends LightningElement {

    @api message = '';

    get getMessage(){
        return this.message;
    }
}