import { Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class tsClock extends ZepetoScriptBehaviour {

    Update() {
        this.transform.GetChild(0).transform.Rotate(new Vector3(0, 0, -1));
        this.transform.GetChild(1).transform.Rotate(new Vector3(0, 0, -1 / 12));
    }

}