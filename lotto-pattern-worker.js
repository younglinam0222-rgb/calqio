importScripts('/lotto-pattern.js');
self.onmessage=event=>{try{self.postMessage({result:LottoPattern.backtest(event.data)});}catch{self.postMessage({error:true});}};
