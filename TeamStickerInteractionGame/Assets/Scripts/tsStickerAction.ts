import { GameObject, Physics, Resources } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';

import tsGameManager from './tsClientStarter';
export default class tsStickerAction extends ZepetoScriptBehaviour {
    private GameManager = GameObject.Find("GameManager").GetComponent<tsGameManager>();
    private effectStickerAction: GameObject;
    
    Start() {
        this.effectStickerAction = Resources.Load("effectStickerAction") as GameObject;
    }

    FixedUpdate() {
        this.Crash2OtherTeamPlayer();
    }

    private GetCloseOtherTeamPlayerSessionID() {
        let hitCollder = Physics.OverlapSphere(this.transform.position, 0.5);

        if(this.GameManager.room.State.players.get_Item(this.GameManager.room.SessionId) === null ){
            console.log(`[Log] tsStickerAction this.GameManager.room.State.players.get_Item(this.GameManager.room.SessionId) is null`);
            console.log(`[Log] this.GameManager.room.SessionId : ${this.GameManager.room.SessionId}`);
            return null;
        }
        
        let isBlue = this.GameManager.room.State.players.get_Item(this.GameManager.room.SessionId).isBlue;

        if (isBlue === null)
            return null;

        for (let i = 0; i < hitCollder.length; i++) {
            if (hitCollder[i].name.includes("ZepetoCharacter")) {
                let parseName = hitCollder[i].name.split("_");
                if (this.GameManager.room.State.players.get_Item(`${parseName[2]}_${parseName[3]}`).isBlue !== isBlue)
                    return `${parseName[2]}_${parseName[3]}`;
            }
        }
        return null;
    }

    private Crash2OtherTeamPlayer() {
        let otherTeamPlayerSessionId = this.GetCloseOtherTeamPlayerSessionID();

        if (otherTeamPlayerSessionId === null)
            return;

        let myPlayerSessionId = this.GameManager.room.SessionId;
        let myTypeOfSticker = this.GameManager.room.State.players.get_Item(myPlayerSessionId).typeOfSticker;
        let otherPlayerTypeOfSticker = this.GameManager.room.State.players.get_Item(otherTeamPlayerSessionId).typeOfSticker;
        let blockTime = this.GameManager.room.State.players.get_Item(myPlayerSessionId).blockTime + this.GameManager.room.State.players.get_Item(otherTeamPlayerSessionId).blockTime;

        if (myTypeOfSticker === "" && otherPlayerTypeOfSticker === "" || blockTime > 0)
            return;

        if (myTypeOfSticker === "" && otherPlayerTypeOfSticker !== "") {
            myTypeOfSticker = otherPlayerTypeOfSticker;
            otherPlayerTypeOfSticker = "";
            console.log(`[after SendBlockTime] NY meTOS : ${myTypeOfSticker} otherTOP: ${otherPlayerTypeOfSticker}`);
        } else if (myTypeOfSticker !== "" && otherPlayerTypeOfSticker === "") {
            otherPlayerTypeOfSticker = myTypeOfSticker;
            myTypeOfSticker = "";
            console.log(`[after SendBlockTime] YN meTOS : ${myTypeOfSticker} otherTOP: ${otherPlayerTypeOfSticker}`);
        } else if (myTypeOfSticker !== "" && otherPlayerTypeOfSticker !== "") {
            myTypeOfSticker = "";
            otherPlayerTypeOfSticker = "";

            this.GameManager.SendDumpSticker(myTypeOfSticker);
            this.GameManager.SendDumpSticker(otherPlayerTypeOfSticker);

            this.GameManager.SendFreezePlayer(otherTeamPlayerSessionId);
            this.GameManager.SendFreezePlayer(myPlayerSessionId);
            console.log(`[after SendBlockTime] YY meTOS : ${myTypeOfSticker} otherTOP: ${otherPlayerTypeOfSticker}`);
        }

        GameObject.Instantiate(this.effectStickerAction, this.gameObject.transform);
        this.GameManager.SendBlockTime(myPlayerSessionId);
        this.GameManager.SendBlockTime(otherTeamPlayerSessionId);
        this.GameManager.SendTypeOfSticker(myPlayerSessionId, myTypeOfSticker);
        this.GameManager.SendTypeOfSticker(otherTeamPlayerSessionId, otherPlayerTypeOfSticker);

    }

}