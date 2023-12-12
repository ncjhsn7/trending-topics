public without sharing class TrendingController {
    
    public static Id currentUserId = UserInfo.getUserId();

    /*
        [
            {
                "attributes":
                {
                    "type": "AggregateResult"
                },
                "n": 1,
                "Ambiente__c": "Fachada",
                "Product2Id": "01t3s0000050KanAAE",
                "Grupo_Loja__c": "SC",
                "Referencia__c": "12900OF"
            },
            {
                "attributes":
                {
                    "type": "AggregateResult"
                },
                "n": 1,
                "Ambiente__c": "Itens de Assentamento",
                "Product2Id": "01t3s0000050KaiAAE",
                "Grupo_Loja__c": "SC",
                "Referencia__c": "12901OF"
            }
        ]
    */

    @AuraEnabled
    public static string getProductComments(String product){
        return JSON.serialize([
            SELECT
                Comment__c
            FROM Product_Comment__c
            WHERE Product__c = :product
            ORDER BY CreatedDate DESC
        ]);
    }

    @AuraEnabled
    public static void createProductComment(String product, String comment){
        insert new Product_Comment__c(
            Product__c = product,
            Comment__c = comment
        );
    }

    @AuraEnabled
    public static void deleteProductComment(String product){
        delete [
            SELECT
                Id
            FROM Product_Comment__c
            WHERE Product__c = :product
        ];
    }

    @AuraEnabled
    public static string getMostLikedProducts(Integer numProducts){
        List<User_Trending_Vote__c> voteCards = [SELECT Up_Votes__c, Down_Votes__c FROM User_Trending_Vote__c];
        Map<String, Integer> productVotes = new Map<String, Integer>();

        for (User_Trending_Vote__c voteCard : voteCards) {
            if(String.isNotBlank(voteCard.Up_Votes__c)){
                for (String upVote : voteCard.Up_Votes__c.removeEnd(';').split(';')) {
                    if(!productVotes.containsKey(upVote))
                        productVotes.put(upVote, 0);
        
                    productVotes.put(upVote, productVotes.get(upVote) + 1);
                }
            }

            if(String.isNotBlank(voteCard.Down_Votes__c)){
                for (String downVote : voteCard.Down_Votes__c.removeEnd(';').split(';')) {
                    if(!productVotes.containsKey(downVote))
                        productVotes.put(downVote, 0);
        
                    productVotes.put(downVote, productVotes.get(downVote) - 1);
                }
            }
        }

        Map<Integer, List<String>> votesProduct = new Map<Integer, List<String>>();
        
        for (String product : productVotes.keySet()) {
            Integer votes = productVotes.get(product);
            
            if(!votesProduct.containsKey(votes))
                votesProduct.put(votes, new List<String>());

            votesProduct.get(votes).add(product);
        }

        List<Integer> votes = new List<Integer>(votesProduct.keySet());
        
        votes.sort();
        System.debug('X: votges product - ' + votesProduct);
        System.debug('X: vote -' + votes);

        List<String> result = new List<String>();
        
        for (Integer i = 0; i < numProducts; i++) {
            if (i > votes.size() - 1)
                break;

            result.addAll(votesProduct.get(votes[i]));  
        }

        System.debug('X: result: ' + result);
        return JSON.serialize([
            SELECT
                count(Id) n, 
                Ambiente__c, 
                Product2Id, 
                description,
                quote.Opportunity.Loja__r.Grupo_Loja__c,
                Product2.Referencia__c,
                Product2.Product_Image_Link__c
            FROM quoteLineItem 
            WHERE Product2Id IN :result
            GROUP BY Ambiente__c, quote.Opportunity.Loja__r.Grupo_Loja__c, Product2.Referencia__c, Product2Id, description, Product2.Product_Image_Link__c
            ORDER BY count(id) DESC LIMIT :numProducts
        ]);
    }

    @AuraEnabled
    public static string getFavorites(){
        User_Trending_Vote__c voteCard = [SELECT Favorites__c FROM User_Trending_Vote__c WHERE User__c = :currentUserId LIMIT 1];
        List<String> favorites = new List<String>(); 
        
        if(voteCard != null && String.isNotBlank(voteCard.Favorites__c)){
            favorites.addAll(voteCard.Favorites__c.split(';'));
        }

        return JSON.serialize([
            SELECT
                count(Id) n, 
                Ambiente__c, 
                Product2Id, 
                description,
                quote.Opportunity.Loja__r.Grupo_Loja__c,
                Product2.Referencia__c,
                Product2.Product_Image_Link__c
            FROM quoteLineItem 
            WHERE Product2Id IN :favorites
            GROUP BY Ambiente__c, quote.Opportunity.Loja__r.Grupo_Loja__c, Product2.Referencia__c, Product2Id, description, Product2.Product_Image_Link__c
            ORDER BY count(id) DESC LIMIT 6
        ]);
    }

    @AuraEnabled
    public static String getTrendingProducts(String ambiente, Boolean byState, String state, String region, Integer timeStamp, Integer numProducts){
        // if(Cache.Org.contains('top6ProductTrending')) {
        //     return String.valueOf(Cache.Org.get('top6ProductTrending'));
        // }

        String fields = 'SELECT count(Id) n, Ambiente__c, Product2Id, Product2.Name ,quote.Opportunity.Loja__r.Grupo_Loja__c,Product2.Referencia__c,Product2.Product_Image_Link__c FROM quoteLineItem WHERE quote.Opportunity.Loja__r.Grupo_Loja__c != null'; 
        String condition = '';
        String groupBy = ' GROUP BY Ambiente__c, quote.Opportunity.Loja__r.Grupo_Loja__c, Product2.Referencia__c, Product2Id, Product2.Name, Product2.Product_Image_Link__c';
        String order = ' ORDER BY count(id) DESC LIMIT :numProducts';
        

        if (!ambiente.equalsIgnoreCase('Qualquer ambiente')) {
            condition += ' AND Ambiente__c = :ambiente';
        }

        if(!byState && !region.equalsIgnoreCase('All')) {
            if(region.equalsIgnoreCase('nordeste'))
                region = 'BA, SE, AL, PE, PB, RN, CE, PI, MA';

            if(region.equalsIgnoreCase('sudeste'))
                region = 'SP, RJ, MG, ES';
            
            if(region.equalsIgnoreCase('sul'))
                region = 'PR, SC, RS';

            if(region.equalsIgnoreCase('centro oeste'))
                region = 'MT, MS, GO, DF';

            if(region.equalsIgnoreCase('norte'))
                region = 'AM, RR, AP, PA, TO, RO, AC';

            List<String> regions = region.split(',');
            condition += ' AND quote.Opportunity.Loja__r.Grupo_Loja__c IN :regions';
        } 
        
        if (byState) {
            condition += ' AND quote.Opportunity.Loja__r.Grupo_Loja__c = :state';
        }

        condition += ' AND quote.LastModifiedDate <= LAST_N_DAYS:' + timeStamp;

        String query = fields + condition + timeStamp + groupBy + order;
        //Cache.Org.put('top6ProductTrending', result, 300);

        return JSON.serialize(Database.query(query));
    }
    /*
[
    {
        "attributes":
        {
            "type": "User_Trending_Vote__c",
            "url": "/services/data/v59.0/sobjects/User_Trending_Vote__c/a2g8A000000mUWnQAM"
        },
        "Id": "a2g8A000000mUWnQAM",
        "Up_Votes__c": "01t3s0000050KanAAE"
    },
    {
        "attributes":
        {
            "type": "User_Trending_Vote__c",
            "url": "/services/data/v59.0/sobjects/User_Trending_Vote__c/a2g8A000000mUWiQAM"
        },
        "Id": "a2g8A000000mUWiQAM",
        "Up_Votes__c": ";01t3s0000050KaiAAE",
        "Favorites__c": ";01t3s0000050KaiAAE"
    }
]
    */

    //sosl tem limite de 2mil rows;

    @AuraEnabled
    public static String findProductsVotes(List<String> products){
        
        Map<String, ProductTrendingInfo> result = new Map<String, ProductTrendingInfo>();

        List<User_Trending_Vote__c> voteCards = (List<User_Trending_Vote__c>) [FIND :getProductQueryGroup(products) IN ALL FIELDS  
        RETURNING User_Trending_Vote__c (Id, User__c, Up_Votes__c, Down_Votes__c, Favorites__c)][0];
        
        System.debug(JSON.serialize(voteCards));
        
        
        for(String product : products){
            result.put(product, new ProductTrendingInfo(product));
        }
        
        for(User_Trending_Vote__c voteCard : voteCards){

            for(String product : products){
                
                Boolean areDownVote = false;
                Boolean areUpVote = false;

                if(String.isNotBlank(voteCard.Up_Votes__c) && voteCard.Up_Votes__c.contains(product))
                    areUpVote = true;

                if(String.isNotBlank(voteCard.Down_Votes__c) && voteCard.Down_Votes__c.contains(product))
                    areDownVote = true;
                
                if(voteCard.User__c == currentUserId){
                    if(String.isNotBlank(voteCard.Favorites__c) &&  voteCard.Favorites__c.contains(product))
                        result.get(product).isFavorite = true;

                    if(areDownVote) 
                        result.get(product).currentUserVote = 'DOWN';
                        
                    if(areUpVote)
                        result.get(product).currentUserVote = 'UP';
                }
                
                if(areUpVote)
                    result.get(product).votesSum += 1;

                if(areDownVote)
                    result.get(product).votesSum -= 1;
            }
        }

        return JSON.serialize(result);
    }

    public class ProductTrendingInfo {
        public ProductTrendingInfo(String product){
            productId = product;
            votesSum = 0;
            currentUserVote = 'ND';
            isFavorite = false;
        }
        @AuraEnabled public Id productId;
        @AuraEnabled public Integer votesSum;
        @AuraEnabled public String currentUserVote;
        @AuraEnabled public Boolean isFavorite;
    }

    @AuraEnabled
    public static void saveUserVote(String vote, String product){

        List<User_Trending_Vote__c> userVotes = [
            SELECT 
                Id,
                Down_Votes__c,
                Favorites__c,
                Up_Votes__c
            FROM User_Trending_Vote__c 
            WHERE User__c =: currentUserId
        ];

        if(userVotes.isEmpty()) 
            userVotes = createNewVoteCard();

        User_Trending_Vote__c currentUserVote = userVotes[0];
        product = product + ';';
        if(vote.equalsIgnoreCase('UP')){
            if(!String.isBlank(currentUserVote.Down_Votes__c) && currentUserVote.Down_Votes__c.contains(product))
                currentUserVote.Down_Votes__c = currentUserVote.Down_Votes__c.remove(product);
            
            if (String.isBlank(currentUserVote.Up_Votes__c))
                currentUserVote.Up_Votes__c = product;
            else
                currentUserVote.Up_Votes__c += product;
        }

        if(vote.equalsIgnoreCase('DOWN')){
            if(!String.isBlank(currentUserVote.Up_Votes__c) && currentUserVote.Up_Votes__c.contains(product))
                currentUserVote.Up_Votes__c = currentUserVote.Up_Votes__c.remove(product);
            
            if (String.isBlank(currentUserVote.Down_Votes__c))
                currentUserVote.Down_Votes__c = product;
            else
                currentUserVote.Down_Votes__c += product;
        }

        if(vote.equalsIgnoreCase('ND')){
            if(currentUserVote.Down_Votes__c != null && currentUserVote.Down_Votes__c.contains(product))
                currentUserVote.Down_Votes__c = currentUserVote.Down_Votes__c.remove(product);

            if(currentUserVote.Up_Votes__c != null && currentUserVote.Up_Votes__c.contains(product))
                currentUserVote.Up_Votes__c = currentUserVote.Up_Votes__c.remove(product);
        }

        if(vote.equalsIgnoreCase('FAVORITE')){         
            if(String.isBlank(currentUserVote.Favorites__c))
                currentUserVote.Favorites__c = product;
            else
                currentUserVote.Favorites__c += product;
        }

        if(vote.equalsIgnoreCase('UNFAVORITE')){
            if(currentUserVote.Favorites__c != null && currentUserVote.Favorites__c.contains(product))
                currentUserVote.Favorites__c.remove(product);
        }

        update currentUserVote;
    }

    public static List<User_Trending_Vote__c> createNewVoteCard(){
        User_Trending_Vote__c newVoteCard = new User_Trending_Vote__c(
            User__c = currentUserId,
            Down_Votes__c = '',
            Favorites__c = '',
            Up_Votes__c = ''
        );

        insert newVoteCard;

        return new List<User_Trending_Vote__c>{newVoteCard};
    }

    public static String getProductQueryGroup(List<String> products){
        String result = '';

        for(String product : products){
            if(result != '')
                result += ' OR ';
            
            result += product;
        }

        System.debug(result);

        return result;
    }

    /*
    
        Querie seleção do usuario: 6 produtos

        Querie mais populares, 9 produtos, divido em 3 ambites diferentes

        Querie todos os produtos que o usuário favoritou

        Querie trending products
    


        -------
        Após cada querie: Busca o total de votos, e oque o usuário votou/favoritou

            {
                productId
                votesSum
                currentUserVote
                isFavorite
            }
    */
}

// String result = JSON.serialize([
        //     SELECT
        //         count(Id) n, 
        //         Ambiente__c, 
        //         Product2Id, 
        //         description,
        //         quote.Opportunity.Loja__r.Grupo_Loja__c,
        //         Product2.Referencia__c,
        //         Product2.Product_Image_Link__c
        //     FROM quoteLineItem 
        //     WHERE quote.Opportunity.Loja__r.Grupo_Loja__c != null
        //     GROUP BY Ambiente__c, quote.Opportunity.Loja__r.Grupo_Loja__c, Product2.Referencia__c, Product2Id, description, Product2.Product_Image_Link__c
        //     ORDER BY count(id) DESC LIMIT 6
        // ]);