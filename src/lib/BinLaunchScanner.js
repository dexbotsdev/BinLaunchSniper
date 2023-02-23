import { WebsocketClient } from 'binance';
import Binance from "node-binance-api";
import logger from "./logger.js";

class BinLaunchScanner {
  constructor(config,emitter) {
    this.bin = new Binance().options({
       api_key: config.apiKeyMain,
      api_secret: config.secretKeyMain,
      beautify: true,
    }); 
    this.currentSymbols=[];
    this.e= emitter;

  }
    
  initializeSymbols=async ()=>{
    const exc = await this.bin.exchangeInfo(); 
    const symA = exc.symbols; 
    symA.forEach(element => {
        this.currentSymbols.push(element.symbol); 
    }); 
  }

  startTracker =  () => {
    this.bin.websockets.miniTicker(markets => {
        for (var key in markets) { 
            if(this.currentSymbols.indexOf(key) === -1)
            { 
                const tokenSignal= { 
                    tokenSymbol:key,
                    enterAtCmp:true,
                    ...markets[key]

                } 
                 this.e.emit('newTokenSignal',tokenSignal)
            }
        }
      });


  }

}

export default BinLaunchScanner;