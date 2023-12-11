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
    public static String getTrendingProducts(
        String ambiente, Boolean byState, String state, String region
    ){
        if(Cache.Org.contains('top6ProductTrending')) {
            return String.valueOf(Cache.Org.get('top6ProductTrending'));
        }

        String result = JSON.serialize([
            SELECT
                count(Id) n, 
                Ambiente__c, 
                Product2Id, 
                description,
                quote.Opportunity.Loja__r.Grupo_Loja__c,
                Product2.Referencia__c
            FROM quoteLineItem 
            WHERE quote.Opportunity.Loja__r.Grupo_Loja__c != null 
            GROUP BY Ambiente__c, quote.Opportunity.Loja__r.Grupo_Loja__c, Product2.Referencia__c, Product2Id, description
            ORDER BY count(id) DESC LIMIT 6
        ]);

        Cache.Org.put('top6ProductTrending', result, 300);

        return result;
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
    public static void findProductsVotes(List<String> products){
        
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

        System.debug(JSON.serialize(result));
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

        if(vote == 'UP'){
            if(currentUserVote.Down_Votes__c != null && currentUserVote.Down_Votes__c.contains(product))
                currentUserVote.Down_Votes__c.remove(product);

            currentUserVote.Up_Votes__c += (';' + product);
        }

        if(vote == 'DOWN'){
            if(currentUserVote.Up_Votes__c != null && currentUserVote.Up_Votes__c.contains(product))
                currentUserVote.Up_Votes__c.remove(product);

            currentUserVote.Down_Votes__c += (';' + product);
        }

        if(vote == 'ND'){
            if(currentUserVote.Down_Votes__c != null && currentUserVote.Down_Votes__c.contains(product))
                currentUserVote.Down_Votes__c.remove(product);

            if(currentUserVote.Up_Votes__c != null && currentUserVote.Up_Votes__c.contains(product))
                currentUserVote.Up_Votes__c.remove(product);
        }

        if(vote == 'FAVORITE'){
            if(currentUserVote.Favorites__c != null)
                currentUserVote.Favorites__c += ';';
            
            if(currentUserVote.Favorites__c == null)
                currentUserVote.Favorites__c = product;
                
            if(!currentUserVote.Favorites__c.contains(product))
                currentUserVote.Favorites__c += product;
        }

        if(vote == 'UNFAVORITE'){
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