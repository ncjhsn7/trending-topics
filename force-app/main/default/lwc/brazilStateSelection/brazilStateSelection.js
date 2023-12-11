import { LightningElement, api, track } from 'lwc';

export default class BrazilStateSelection extends LightningElement {

    @api recordId;

    @track selectionByState = true;
    @track selectedState;

    handleRegionClick(event) {
        event.preventDefault();

        const region = event.currentTarget.dataset.region;

        if(region && region.length == 2){

            if(this.selectedState == region)
                this.selectedState = null;
            else
                this.selectedState = region;
        }

        console.log(this.selectedState);

        return false;
    }

    handleToggleSelection(event){
        const question = event.target.dataset.question;
        const value = event.target.dataset.value;
    
        console.log(value);

        this.selectionByState = value == 'Sim';
    }



    get isTOSelected(){
        return this.selectedState == 'TO' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isBASelected(){
        return this.selectedState == 'BA' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isSESelected(){
        return this.selectedState == 'SE' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isPESelected(){
        return this.selectedState == 'PE' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isALSelected(){
        return this.selectedState == 'AL' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isRNSelected(){
        return this.selectedState == 'RN' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isCESelected(){
        return this.selectedState == 'CE' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isPISelected(){
        return this.selectedState == 'PI' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isMASelected(){
        return this.selectedState == 'MA' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isAPSelected(){
        return this.selectedState == 'AP' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isPASelected(){
        return this.selectedState == 'PA' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isRRSelected(){
        return this.selectedState == 'RR' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isAMSelected(){
        return this.selectedState == 'AM' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isACSelected(){
        return this.selectedState == 'AC' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isROSelected(){
        return this.selectedState == 'RO' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isMTSelected(){
        return this.selectedState == 'MT' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isMSSelected(){
        return this.selectedState == 'MS' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isGOSelected(){
        return this.selectedState == 'GO' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isPRSelected(){
        return this.selectedState == 'PR' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isSCSelected(){
        return this.selectedState == 'SC' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isRSSelected(){
        return this.selectedState == 'RS' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isSPSelected(){
        return this.selectedState == 'SP' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isMGSelected(){
        return this.selectedState == 'MG' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isRJSelected(){
        return this.selectedState == 'RJ' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isESSelected(){
        return this.selectedState == 'ES' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isDFSelected(){
        return this.selectedState == 'DF' ? 'fill: #003399' : 'fill: #0094d9';
    }
    get isPBSelected(){
        return this.selectedState == 'PB' ? 'fill: #003399' : 'fill: #0094d9';
    }


    //by region

    //MA,PI,CE,RN,PB,PE,AL,SE,BA
    get isNordeste(){
        return ['MA','PI','CE','RN','PB','PE','AL','SE','BA'].includes(this.selectedState) ? 'fill: #003399' : 'fill: #4299E1';
    }

    //'MG', 'ES', 'SP', 'RJ'
    get isSudeste(){
        return ['MG', 'ES', 'SP', 'RJ'].includes(this.selectedState) ? 'fill: #003399' : 'fill: #63B3ED';

    }

    //'PR', 'SC', 'RS'
    get isSul(){
        return ['PR', 'SC', 'RS'].includes(this.selectedState) ? 'fill: #003399' : 'fill: #00A3C4';

    }

    //'MT', 'GO', 'MS', 'DF'
    get isCentroOeste(){
        return ['MT', 'GO', 'MS', 'DF'].includes(this.selectedState) ? 'fill: #003399' : 'fill: #4FD1C5';

    }

    //'AM', 'PA', 'AC', 'RO', 'TO', 'AP', 'RR'
    get isNorte(){
        return ['AM', 'PA', 'AC', 'RO', 'TO', 'AP', 'RR'].includes(this.selectedState) ? 'fill: #003399' : 'fill: #0BC5EA';
    }

    get currentRegion(){
        if(['MA','PI','CE','RN','PB','PE','AL','SE','BA'].includes(this.selectedState))
            return 'Nordeste';

        if(['MG', 'ES', 'SP', 'RJ'].includes(this.selectedState))
            return 'Sudeste';

        if(['PR', 'SC', 'RS'].includes(this.selectedState))
            return 'Sul';

        if(['MT', 'GO', 'MS', 'DF'].includes(this.selectedState))
            return 'Centro Oeste';

        if(['AM', 'PA', 'AC', 'RO', 'TO', 'AP', 'RR'].includes(this.selectedState))
            return 'Norte';

        return 'all';
    }
}