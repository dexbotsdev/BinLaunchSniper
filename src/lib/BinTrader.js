import Binance from "node-binance-api";
import logger from "./logger.js";

class BinTrader {
  constructor(config) {
    this.bin = new Binance().options({
      APIKEY: config.apiKey,
      APISECRET: config.secretKey, 
      family: 4,
    });
    this.investAmount = config.fundsPerTrade;
    this.tpLimits = config.numberOfTakeProfits;
    this.stopLoss = config.stopLoss;
    this.trailingStopLoss = config.trailingStopLoss;
    this.leverage = config.leverage;
    this.closePositionAfterXMinutes = config.closePositionAfterXMinutes;
    this.maximumNumberOfOpenPositions = config.maximumNumberOfOpenPositions;
    this.entryType = config.entryType;
    this.cancelTrade = config.cancelTrade;
  }
  
  getAccount = async () => {
    return await this.bin.futuresAccount();
  }

  verifyAccount = async () => {
    const account = await this.getAccount();
    logger.docs('Veifying Account ', account.code);
    if (Number(account.code) < 0) return false;
    else return true;
  }

  getBalance = async (currency) => {
    let bal;
    const balance = await this.bin.balance();
    for (var key in balance) { 
       
      if(key === currency) 
      {
        bal = parseFloat(balance[key].available);
      }
    } 

    return bal;
  };
  

  takeProfitOrder = async (side, symbol, quantity, takeProfitPrice) => {
    return this.bin.Order(side === 'LONG' ? 'SELL' : 'BUY', symbol, quantity, false, {
      type: "TAKE_PROFIT_MARKET",
      closePosition: true,
      stopPrice: takeProfitPrice,
      quantity: quantity,
      workingType: "CONTRACT_PRICE",
    });
  }


  stopLossOrder = async (side, symbol, quantity, takeProfitPrice) => {
    return this.bin.Order(side === 'LONG' ? 'SELL' : 'BUY', symbol, quantity, false, {
      type: "STOP_MARKET",
      closePosition: true,
      stopPrice: takeProfitPrice,
      quantity: quantity,
      workingType: "CONTRACT_PRICE",
    });
  }


  tradeEnterSignal = async (tradeSignal, config) => {
 
    let coin = tradeSignal.tokenSymbol;
     

    let balance = await this.getBalance("USDT");

     if(balance < config.fundsPerTrade){

      logger.error('Not Enough USDT Balance in account '+balance)

     } else {
        const price = tradeSignal.close;
        const quantity = parseFloat(config.fundsPerTrade)/parseFloat(price);
        let type1 = "STOP_LOSS"; 
        let type2 = "TAKE_PROFIT"; 
        let stopPrice = parseFloat(price) - (parseFloat(config.stopLoss)*parseFloat(price)/100);
        let takeProfit = parseFloat(price)+ (parseFloat(config.takeProfit)*parseFloat(price)/100);
        this.bin.marketBuy(coin,quantity, (error, response) => {

          if(response.orderId){
            console.info("Market Buy response", response);
            console.info("order id: " + response.orderId); 
            this.bin.sell(coin, quantity, price, {stopPrice: stopPrice, type: type1});
            this.bin.sell(coin, quantity, price, {stopPrice: takeProfit, type: type2});
  
          }
         
           
        });
     }

  }

}

export default BinTrader;