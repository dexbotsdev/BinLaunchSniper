
import { EventEmitter } from "emitter";
import fs from 'fs'
import BinTrader from "./src/lib/BinTrader.js"; 
import logger from "./src/lib/logger.js"; 
import BinLaunchScanner from "./src/lib/BinLaunchScanner.js";

const eventEmitter = new EventEmitter();
let config=null; 
async function start() {
    fs.readFile('./config.json', 'utf8', async (error, data) => {
        if(error){
           console.log(error);
           return;
        }
        config= JSON.parse(data);  
         let ts = new BinTrader(config); 
 
        let bin = new BinLaunchScanner(config,eventEmitter);
        await bin.initializeSymbols();
        const accountCheck = true;//await ts.verifyAccount();

        if(!accountCheck){
            logger.error('API Keys Invalid or Account Not Found');
            process.exit(0);
        }
         bin.startTracker();
        eventEmitter.on('newListener', (event, listener) => {
            logger.info(`Added  NewLaunch ${event.toUpperCase()} listener.`);
          });

        eventEmitter.on('newTokenSignal', async (tradeSignal) => {
            logger.info('Recieved ');

            logger.info('Open New Market Trade for Signal for SYMBOL - '+ tradeSignal.tokenSymbol)
             try{
              
               ts.tradeEnterSignal(tradeSignal,config);

             }catch(error){
                console.log(error)
             }
            
        });  
        
        
    }) 
 } 

start();

