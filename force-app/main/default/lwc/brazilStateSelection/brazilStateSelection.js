import { LightningElement, api, track } from 'lwc';
import getTrendingProducts from '@salesforce/apex/TrendingController.getTrendingProducts';

export default class BrazilStateSelection extends LightningElement {

    self = this;

    @api recordId;

    @track selectionByState = true;
    @track selectedState;

    @track isLoading = {
        productsSearch: true
    }

    @track trendingProducts = [];

    get dontHasTrendingItems(){
        console.log('showItems: ', this.trendingProducts.length == 0)
        return this.trendingProducts.length == 0;
    }

    runGetTrendingProducts(){
        // public static String getTrendingProducts(String ambiente, Boolean byState, String state, String region, String timeStamp, String numProducts)

        this.isLoading.productsSearch = true;

        const request = {
            ambiente: this.getAmbient,
            byState: this.selectionByState && this.currentRegion == 'all' ? false : this.selectionByState,
            state: this.selectedState,
            region: this.currentRegion,
            timeStamp: this.currentTimeStamp,
            numProducts: 6
        };

        console.table(request);

        getTrendingProducts(
            request
        )
        .then(res => {
            console.log(res);
            this.trendingProducts = JSON.parse(res);
        })
        .catch(err => {
            console.log('err: ', JSON.stringify(err));
        })
        .finally(()=>{
            this.isLoading.productsSearch = false;
        })

    }

    connectedCallback(){
        this.runGetTrendingProducts();
    }

    get getPlace(){
        let current = '';

        if(!this.selectionByState)
            current = this.currentRegion;

        if(this.selectionByState)
            current = this.selectedState;

        if(!!!this.selectedState)
            current = 'todo Brasil';

        return current;
    }

    get getNo(){
        return this.selectedState != null ? ' no ' : ' em ';
    }

    get getAmbient(){
        return this.selectedAmbient;
    }

    get getIsOneDay(){
        return this.currentTimeStamp == '1';
    }

    get getIsSevenDay(){
        return this.currentTimeStamp == '7';
    }

    get getIsfiftyteenDay(){
        return this.currentTimeStamp == '15';
    }

    currentTimeStamp = 1;

    handleTimeSelection(event){
        const value = event.target.dataset.value;

        this.currentTimeStamp = value;

        console.log(this.currentTimeStamp);

        this.runGetTrendingProducts();
    }

    selectedAmbient = 'Qualquer ambiente';

    get ambients() {
        return [
            { label: 'Qualquer ambiente', value: 'Qualquer ambiente' },
            { label: 'Área Externa', value: 'Área Externa' },
            { label: 'Cozinha', value: 'Cozinha' },
            { label: 'Espaço Gourmet', value: 'Espaço Gourmet' },
            { label: 'Escada', value: 'Escada' },
            { label: 'Garagem', value: 'Garagem' },
            { label: 'Dormitório', value: 'Dormitório' },
            { label: 'Closet', value: 'Closet' },
            { label: 'Área de Serviço', value: 'Área de Serviço' },
            { label: 'Dormitório de Serviço', value: 'Dormitório de Serviço' },
            { label: 'Escritório', value: 'Escritório' },
            { label: 'Sala', value: 'Sala' },
            { label: 'Banheiro', value: 'Banheiro' },
            { label: 'Lavabo', value: 'Lavabo' },
            { label: 'Officina', value: 'Officina' },
            { label: 'Fachada', value: 'Fachada' },
            { label: 'Piscina', value: 'Piscina' },
            { label: 'Estabelecimento Comercial', value: 'Estabelecimento Comercial' },
            { label: 'Varanda', value: 'Varanda' },
            { label: 'Sacada', value: 'Sacada' },
            { label: 'Terraço', value: 'Terraço' },
            { label: 'Circulação', value: 'Circulação' },
            { label: 'Hall de Entrada', value: 'Hall de Entrada' },
            { label: 'Itens de Assentamento', value: 'Itens de Assentamento' },
            { label: 'Toda casa', value: 'Toda casa'},
        ];
    }

    handleChange(event){
        this.selectedAmbient = event.detail.value;
        this.runGetTrendingProducts();
    }




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

        this.runGetTrendingProducts();

        return false;
    }

    handleToggleSelection(event){
        const question = event.target.dataset.question;
        const value = event.target.dataset.value;
    
        console.log(value);

        this.selectionByState = value == 'Sim';

        this.runGetTrendingProducts();
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