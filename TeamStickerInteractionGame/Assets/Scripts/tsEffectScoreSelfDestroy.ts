import { GameObject } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

import * as UnityEngine from "UnityEngine";

export default class tsEffectScoreSelfDestroy extends ZepetoScriptBehaviour {

    Start() { 
        this.Invoke("SelfDestroy", 300000);
        console.log(`[Log] 인보크 this.Invoke("SelfDestroy", 10);`);
    }

    SelfDestroy(){
        GameObject.Destroy(this.gameObject);
        console.log(`[Log] GameObject.Destroy(${this.gameObject});`);

    }
}