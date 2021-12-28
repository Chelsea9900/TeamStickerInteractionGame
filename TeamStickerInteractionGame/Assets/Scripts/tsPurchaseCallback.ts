import { ZepetoScriptBehaviour } from 'ZEPETO.Script';

export default class NewTypescript extends ZepetoScriptBehaviour {

    OnPurchaseComplete(item){
        console.log(`OnPurchaseComplete ${item}`);
    }

    OnPurchaseFailed(error){
        console.log("OnPurchaseFailed : " + error.message);
    }

}